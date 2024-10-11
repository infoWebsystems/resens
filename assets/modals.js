document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById('sendResumeForm');
  const overlay = document.querySelector('.form-overlay');
  const btnCloseModal = modal.querySelector('.form-modal-close');
  const btnsOpenModal = document.querySelectorAll('#onSendResumeFormOpen');

  const openModal = function () {
    overlay.classList.remove('form-modal-hidden');
    modal.classList.remove('form-modal-hidden');
    document.querySelector('body').style.overflow = 'hidden';
  }

  const closeModal = function () {
    overlay.classList.add('form-modal-hidden');
    modal.classList.add('form-modal-hidden');
    document.querySelector('body').style.overflow = 'auto';
  }

  for (let i = 0; i < btnsOpenModal.length; i++) {
    btnsOpenModal[i].addEventListener('click', openModal);
  }

  btnCloseModal.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('form-modal-hidden')) {
      closeModal();
    }
  })
})

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById('partnershipForm');
  const overlay = document.querySelector('.form-overlay');
  const btnCloseModal = modal.querySelector('.form-modal-close');
  const btnsOpenModal = document.querySelectorAll('#onPartnershipForm');

  const openModal = function () {
    overlay.classList.remove('form-modal-hidden');
    modal.classList.remove('form-modal-hidden');
    document.querySelector('body').style.overflow = 'hidden';
  }

  const closeModal = function () {
    overlay.classList.add('form-modal-hidden');
    modal.classList.add('form-modal-hidden');
    document.querySelector('body').style.overflow = 'auto';
  }

  for (let i = 0; i < btnsOpenModal.length; i++) {
    btnsOpenModal[i].addEventListener('click', openModal);
  }

  btnCloseModal.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('form-modal-hidden')) {
      closeModal();
    }
  })
})

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById('thankYouModal');
  const overlay = document.querySelector('.form-overlay');
  const btnCloseModal = modal.querySelector('.modal-thank-you-close');
  const btnContinueModal = modal.querySelector('.modal-thank-you-button');
  const btnsOpenModal = document.querySelectorAll('#onThankYouModal');

  const openModal = function () {
    overlay.classList.remove('form-modal-hidden');
    modal.classList.remove('modal-thank-you-hidden');
    document.querySelector('body').style.overflow = 'hidden';
  }

  const closeModal = function () {
    overlay.classList.add('form-modal-hidden');
    modal.classList.add('modal-thank-you-hidden');
    document.querySelector('body').style.overflow = 'auto';
  }

  for (let i = 0; i < btnsOpenModal.length; i++) {
    btnsOpenModal[i].addEventListener('click', openModal);
  }

  btnCloseModal.addEventListener('click', closeModal);
  btnContinueModal.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('modal-thank-you-hidden')) {
      closeModal();
    }
  })
})