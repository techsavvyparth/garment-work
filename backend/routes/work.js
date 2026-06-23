const express = require('express');
const { collection } = require('../utils/jsonDB');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET work types list (must be before /:id)
router.get('/types/list', protect, (req, res) => {
  try {
    const types = collection('works').distinct('workType', { createdBy: req.user._id });
    res.json({ success: true, types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all work entries
router.get('/', protect, (req, res) => {
  try {
    const { lady, month, year } = req.query;
    const Works = collection('works');
    const Ladies = collection('ladies');

    let works = Works.find({ createdBy: req.user._id });
    if (lady) works = works.filter(w => w.lady === lady);
    if (month) works = works.filter(w => {
      const d = new Date(w.date);
      return (d.getMonth() + 1) === Number(month);
    });
    if (year) works = works.filter(w => new Date(w.date).getFullYear() === Number(year));

    works.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Populate lady name
    const ladyMap = {};
    Ladies.find({ createdBy: req.user._id }).forEach(l => { ladyMap[l._id] = l; });
    const populated = works.map(w => ({ ...w, lady: ladyMap[w.lady] ? { _id: w.lady, name: ladyMap[w.lady].name, mobile: ladyMap[w.lady].mobile } : { _id: w.lady, name: 'Unknown' } }));

    res.json({ success: true, works: populated, total: populated.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create work
router.post('/', protect, (req, res) => {
  try {
    const { lady, workType, quantity, rate, date, notes, paymentStatus } = req.body;
    if (!lady || !workType || !quantity || !rate) return res.status(400).json({ success: false, message: 'lady, workType, quantity and rate are required' });
    const d = date ? new Date(date) : new Date();
    const totalAmount = Number(quantity) * Number(rate);
    const work = collection('works').create({ lady, workType, quantity: Number(quantity), rate: Number(rate), totalAmount, date: d.toISOString(), notes: notes || '', paymentStatus: paymentStatus || 'pending', month: d.getMonth() + 1, year: d.getFullYear(), createdBy: req.user._id });

    const ladyDoc = collection('ladies').findById(lady);
    const populated = { ...work, lady: ladyDoc ? { _id: lady, name: ladyDoc.name, mobile: ladyDoc.mobile } : { _id: lady } };
    res.status(201).json({ success: true, work: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update work
router.put('/:id', protect, (req, res) => {
  try {
    const Works = collection('works');
    const work = Works.findById(req.params.id);
    if (!work || work.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Work entry not found' });
    const { quantity, rate, date } = req.body;
    const d = date ? new Date(date) : new Date(work.date);
    const totalAmount = Number(quantity || work.quantity) * Number(rate || work.rate);
    const updated = Works.updateById(req.params.id, { ...req.body, totalAmount, month: d.getMonth() + 1, year: d.getFullYear() });
    res.json({ success: true, work: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE work
router.delete('/:id', protect, (req, res) => {
  try {
    const Works = collection('works');
    const work = Works.findById(req.params.id);
    if (!work || work.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Work entry not found' });
    Works.deleteById(req.params.id);
    res.json({ success: true, message: 'Work entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
