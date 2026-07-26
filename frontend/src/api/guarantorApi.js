import api from './api';

function unwrap(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return new Error(detail.map((item) => item.msg).join(' '));
  }
  return new Error(detail || error?.message || fallback);
}

export async function createGuarantorInvitation(payload) {
  try {
    return (await api.post('/guarantors/invitations', payload)).data;
  } catch (error) {
    throw unwrap(error, 'Unable to create guarantor invitation.');
  }
}

export async function getWorkerGuarantors(workerId) {
  try {
    return (await api.get(`/guarantors/worker/${encodeURIComponent(workerId)}`)).data;
  } catch (error) {
    throw unwrap(error, 'Unable to load guarantor records.');
  }
}

export async function getGuarantorByToken(token) {
  try {
    return (await api.get(`/guarantors/public/${encodeURIComponent(token)}`)).data;
  } catch (error) {
    throw unwrap(error, 'Unable to open guarantor invitation.');
  }
}

export async function submitGuarantorForm(token, payload) {
  try {
    return (await api.post(`/guarantors/public/${encodeURIComponent(token)}/submit`, payload)).data;
  } catch (error) {
    throw unwrap(error, 'Unable to submit guarantor form.');
  }
}

export async function reviewGuarantor(id, decision, note = '') {
  try {
    return (await api.patch(`/guarantors/${encodeURIComponent(id)}/review`, {
      decision,
      note,
    })).data;
  } catch (error) {
    throw unwrap(error, 'Unable to review guarantor record.');
  }
}

export async function listGuarantors() {
  try {
    return (await api.get('/guarantors')).data;
  } catch (error) {
    throw unwrap(error, 'Unable to load guarantor submissions.');
  }
}
