import * as repo from '../repositories/vacatures.repo.js';

export const list = (filter) => repo.listVacatures(filter);
export const getById = (id) => repo.getVacatureById(id);
export const create = (payload) => repo.createVacature(payload);
export const update = (id, payload) => repo.updateVacature(id, payload);
export const remove = (id) => repo.deleteVacature(id);

