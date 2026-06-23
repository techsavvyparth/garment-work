const express = require('express');
const { collection } = require('../utils/jsonDB');
const { protect } = require('../middleware/auth');
const router = express.Router();

const getCollections = () => ({
  Ladies: collection('ladies'),
  Works: collection('works'),
  Payments: collection('payments'),
});

// GET all ladies with financial summary
router.get('/', protect, (req, res) => {
  try {
    const { search, status } = req.query;
    const { Ladies, Works, Payments } = getCollections();

    let query = { createdBy: req.user._id };
    if (status) query.status = status;

    let ladies = Ladies.find(query);
    if (search) {
      const re = new RegExp(search, 'i');
      ladies = ladies.filter(l => re.test(l.name) || re.test(l.mobile));
    }

    ladies.sort((a, b) => a.name.localeCompare(b.name));

    const ladiesWithSummary = ladies.map(lady => {
      const works = Works.find({ lady: lady._id });
      const payments = Payments.find({ lady: lady._id });
      const totalWork = works.reduce((s, w) => s + (w.totalAmount || 0), 0);
      const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const lastWork = works.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return { ...lady, totalWorkAmount: totalWork, totalPaidAmount: totalPaid, pendingAmount: totalWork - totalPaid, lastWorkDate: lastWork?.date || null };
    });

    res.json({ success: true, ladies: ladiesWithSummary, total: ladiesWithSummary.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single lady with full details
router.get('/:id', protect, (req, res) => {
  try {
    const { month, year } = req.query;
    const { Ladies, Works, Payments } = getCollections();

    const lady = Ladies.findById(req.params.id);
    if (!lady || lady.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Lady not found' });

    const now = new Date();
    const filterMonth = month ? Number(month) : now.getMonth() + 1;
    const filterYear = year ? Number(year) : now.getFullYear();

    const allWork = Works.find({ lady: lady._id }).sort ? Works.find({ lady: lady._id }) : Works.find({ lady: lady._id });
    allWork.sort((a, b) => new Date(b.date) - new Date(a.date));

    const monthWork = allWork.filter(w => {
      const d = new Date(w.date);
      return (d.getMonth() + 1) === filterMonth && d.getFullYear() === filterYear;
    });

    const allPayments = Payments.find({ lady: lady._id });
    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalWork = allWork.reduce((s, w) => s + (w.totalAmount || 0), 0);
    const totalPaid = allPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const currentMonthTotal = monthWork.reduce((s, w) => s + (w.totalAmount || 0), 0);

    res.json({
      success: true,
      lady,
      allWork,
      monthWork,
      allPayments,
      summary: { totalWorkAmount: totalWork, totalPaidAmount: totalPaid, pendingAmount: totalWork - totalPaid, currentMonthTotal },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create lady
router.post('/', protect, (req, res) => {
  try {
    const lady = collection('ladies').create({ ...req.body, createdBy: req.user._id, status: req.body.status || 'active' });
    res.status(201).json({ success: true, lady });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update lady
router.put('/:id', protect, (req, res) => {
  try {
    const Ladies = collection('ladies');
    const lady = Ladies.findById(req.params.id);
    if (!lady || lady.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Lady not found' });
    const updated = Ladies.updateById(req.params.id, req.body);
    res.json({ success: true, lady: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE lady
router.delete('/:id', protect, (req, res) => {
  try {
    const { Ladies, Works, Payments } = getCollections();
    const lady = Ladies.findById(req.params.id);
    if (!lady || lady.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Lady not found' });
    Ladies.deleteById(req.params.id);
    Works.deleteMany({ lady: req.params.id });
    Payments.deleteMany({ lady: req.params.id });
    res.json({ success: true, message: 'Lady and all related data deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
