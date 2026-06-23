const express = require('express');
const { collection } = require('../utils/jsonDB');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET all payments
router.get('/', protect, (req, res) => {
  try {
    const { lady, month, year } = req.query;
    const Payments = collection('payments');
    const Ladies = collection('ladies');

    let payments = Payments.find({ createdBy: req.user._id });
    if (lady) payments = payments.filter(p => p.lady === lady);
    if (month) payments = payments.filter(p => new Date(p.date).getMonth() + 1 === Number(month));
    if (year) payments = payments.filter(p => new Date(p.date).getFullYear() === Number(year));

    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    const ladyMap = {};
    Ladies.find({ createdBy: req.user._id }).forEach(l => { ladyMap[l._id] = l; });
    const populated = payments.map(p => ({ ...p, lady: ladyMap[p.lady] ? { _id: p.lady, name: ladyMap[p.lady].name, mobile: ladyMap[p.lady].mobile } : { _id: p.lady } }));

    res.json({ success: true, payments: populated, total: populated.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create payment
router.post('/', protect, (req, res) => {
  try {
    const { lady, amount, method, date, notes } = req.body;
    if (!lady || !amount) return res.status(400).json({ success: false, message: 'Lady and amount required' });
    const d = date ? new Date(date) : new Date();
    const payment = collection('payments').create({ lady, amount: Number(amount), method: method || 'cash', date: d.toISOString(), notes: notes || '', month: d.getMonth() + 1, year: d.getFullYear(), createdBy: req.user._id });
    const ladyDoc = collection('ladies').findById(lady);
    const populated = { ...payment, lady: ladyDoc ? { _id: lady, name: ladyDoc.name, mobile: ladyDoc.mobile } : { _id: lady } };
    res.status(201).json({ success: true, payment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update payment
router.put('/:id', protect, (req, res) => {
  try {
    const Payments = collection('payments');
    const payment = Payments.findById(req.params.id);
    if (!payment || payment.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Payment not found' });
    const updated = Payments.updateById(req.params.id, req.body);
    res.json({ success: true, payment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE payment
router.delete('/:id', protect, (req, res) => {
  try {
    const Payments = collection('payments');
    const payment = Payments.findById(req.params.id);
    if (!payment || payment.createdBy !== req.user._id) return res.status(404).json({ success: false, message: 'Payment not found' });
    Payments.deleteById(req.params.id);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
