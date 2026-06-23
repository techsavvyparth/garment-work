const express = require('express');
const { collection } = require('../utils/jsonDB');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Dashboard summary
router.get('/dashboard', protect, (req, res) => {
  try {
    const uid = req.user._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const Ladies = collection('ladies');
    const Works = collection('works');
    const Payments = collection('payments');

    const allLadies = Ladies.find({ createdBy: uid });
    const activeLadies = allLadies.filter(l => l.status === 'active');
    const allWorks = Works.find({ createdBy: uid });
    const allPayments = Payments.find({ createdBy: uid });

    const monthWorks = allWorks.filter(w => new Date(w.date).getMonth() + 1 === month && new Date(w.date).getFullYear() === year);
    const currentMonthWork = monthWorks.reduce((s, w) => s + (w.totalAmount || 0), 0);
    const totalPaid = allPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalWork = allWorks.reduce((s, w) => s + (w.totalAmount || 0), 0);
    const totalPending = totalWork - totalPaid;

    // Pending ladies
    const pendingLadies = allLadies.map(lady => {
      const lw = allWorks.filter(w => w.lady === lady._id).reduce((s, w) => s + (w.totalAmount || 0), 0);
      const lp = allPayments.filter(p => p.lady === lady._id).reduce((s, p) => s + (p.amount || 0), 0);
      return { ...lady, totalWork: lw, pending: lw - lp };
    }).filter(l => l.pending > 0).sort((a, b) => b.pending - a.pending).slice(0, 5);

    // Monthly chart (last 6 months)
    const chartMap = {};
    allWorks.forEach(w => {
      const d = new Date(w.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      chartMap[key] = (chartMap[key] || 0) + (w.totalAmount || 0);
    });
    const monthlyChart = Object.entries(chartMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, work]) => {
        const [y, m] = key.split('-');
        return { _id: { month: Number(m), year: Number(y) }, work };
      });

    // Recent work
    const ladyMap = {};
    allLadies.forEach(l => { ladyMap[l._id] = l; });
    const recentWork = [...allWorks]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(w => ({ ...w, lady: ladyMap[w.lady] ? { name: ladyMap[w.lady].name } : { name: 'Unknown' } }));

    res.json({
      success: true,
      data: { ladyCount: activeLadies.length, currentMonthWork, totalPaid, totalPending, pendingLadies, monthlyChart, recentWork },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Monthly report for PDF
router.get('/lady/:id/monthly', protect, (req, res) => {
  try {
    const { month, year } = req.query;
    const uid = req.user._id;

    const lady = collection('ladies').findById(req.params.id);
    if (!lady || lady.createdBy !== uid) return res.status(404).json({ success: false, message: 'Lady not found' });

    const allWorks = collection('works').find({ lady: lady._id, createdBy: uid });
    const allPayments = collection('payments').find({ lady: lady._id, createdBy: uid });

    const m = Number(month);
    const y = Number(year);
    const works = allWorks.filter(w => new Date(w.date).getMonth() + 1 === m && new Date(w.date).getFullYear() === y);
    const payments = allPayments.filter(p => new Date(p.date).getMonth() + 1 === m && new Date(p.date).getFullYear() === y);

    works.sort((a, b) => new Date(a.date) - new Date(b.date));
    payments.sort((a, b) => new Date(a.date) - new Date(b.date));

    const monthTotal = works.reduce((s, w) => s + (w.totalAmount || 0), 0);
    const monthPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalWorkEver = allWorks.reduce((s, w) => s + (w.totalAmount || 0), 0);
    const totalPaidEver = allPayments.reduce((s, p) => s + (p.amount || 0), 0);

    res.json({
      success: true, lady, works, payments,
      summary: { monthTotal, monthPaid, monthPending: monthTotal - monthPaid, totalWorkEver, totalPaidEver, overallPending: totalWorkEver - totalPaidEver },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Pending report
router.get('/pending', protect, (req, res) => {
  try {
    const uid = req.user._id;
    const ladies = collection('ladies').find({ createdBy: uid });
    const allWorks = collection('works').find({ createdBy: uid });
    const allPayments = collection('payments').find({ createdBy: uid });

    const data = ladies.map(lady => {
      const totalWork = allWorks.filter(w => w.lady === lady._id).reduce((s, w) => s + (w.totalAmount || 0), 0);
      const totalPaid = allPayments.filter(p => p.lady === lady._id).reduce((s, p) => s + (p.amount || 0), 0);
      return { ...lady, totalWork, totalPaid, pending: totalWork - totalPaid };
    }).filter(l => l.pending > 0).sort((a, b) => b.pending - a.pending);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
