import * as service from '../services/vacatures.service.js';

export async function list(req, res, next) {
  try {
    const { q, dienstverband } = req.query;
    const actief = typeof req.query.actief !== 'undefined' ? Number(req.query.actief) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const { rows, total } = await service.list({ q, dienstverband, actief, page, limit });
    res.json({ data: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await service.getById(id);
    if (!row) return res.status(404).json({ error: 'Vacature niet gevonden' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = await service.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Vacature niet gevonden' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const ok = await service.remove(id);
    if (!ok) return res.status(404).json({ error: 'Vacature niet gevonden' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

