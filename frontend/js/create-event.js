async function createEvent(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const err = document.getElementById('error');
  const submit = form.querySelector('button[type="submit"]');

  if (err) err.textContent = '';
  if (submit) submit.disabled = true;

  try {
    const dateValue = document.getElementById('eventDate').value;

    const payload = {
      name: document.getElementById('name').value.trim(),
      event_type: document.getElementById('eventType').value.trim() || null,
      description: document.getElementById('description').value.trim() || null,
      location: document.getElementById('location').value.trim() || null,
      event_date: dateValue ? new Date(dateValue).toISOString() : null,
      attendees: Number(document.getElementById('attendees').value || 0),
      budget: Number(document.getElementById('budget').value || 0),
      status: document.getElementById('status').value
    };

    await apiRequest('/api/events/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Create thành công: quay về Dashboard để thấy event mới.
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('CREATE EVENT ERROR:', error);
    if (err) err.textContent = error.message || 'Không thể tạo event.';
    if (submit) submit.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('createEventForm');

  if (!form) {
    console.error('Không tìm thấy form #createEventForm.');
    return;
  }

  form.addEventListener('submit', createEvent);
});
