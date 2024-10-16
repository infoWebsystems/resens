document.addEventListener("DOMContentLoaded", () => {
  function formModalInit (modalElem, closeElem, triggerElem, isSubmittable = false) {
    const modal = document.getElementById(modalElem);
    const overlay = document.querySelector('.form-overlay');
    const btnsCloseModal = modal.querySelectorAll(closeElem);
    const btnsOpenModal = document.querySelectorAll(triggerElem);

    const openModal = function (e) {
      e.preventDefault();
      overlay.classList.remove('hidden');
      modal.classList.remove('hidden');
      document.querySelector('body').style.overflow = 'hidden';
    }

    const closeModal = function () {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
      document.querySelector('body').style.overflow = 'auto';

      if (window.location.href.indexOf('?contact_posted=true') !== -1) {
        window.history.replaceState(null, null, window.location.pathname);
      }
    }

    for (let i = 0; i < btnsOpenModal.length; i++) {
      btnsOpenModal[i].addEventListener('click', openModal);
    }

    btnsCloseModal.forEach(closeBtn => {
      closeBtn.addEventListener('click', closeModal);
    })

    overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    })

    // Show Thank you Modal
    if (isSubmittable) {
      const isSubmittedSuccessfully = modal.querySelector('.form-modal-submit').getAttribute('data-is-submitted-successfully');

      if (isSubmittedSuccessfully === 'true') {
        overlay.classList.remove('hidden');
        document.getElementById('thankYouModal').classList.remove('hidden');
        document.querySelector('body').style.overflow = 'hidden';
      }
    }
  }

  formModalInit('sendResumeForm', '.form-modal-close', '.onSendResumeFormOpen', true);
  formModalInit('partnershipForm', '.form-modal-close', '.onPartnershipForm', true);
  formModalInit('thankYouModal', '.modal-thank-you-close', '.onThankYouModal');
})