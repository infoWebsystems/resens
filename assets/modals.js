document.addEventListener("DOMContentLoaded", () => {
  function formModalInit (modalElem, closeElem, triggerElem) {
    const modal = document.getElementById(modalElem);
    const overlay = document.querySelector('.form-overlay');
    const btnsCloseModal = modal.querySelectorAll(closeElem);
    const btnsOpenModal = document.querySelectorAll(triggerElem);

    const openModal = function () {
      overlay.classList.remove('hidden');
      modal.classList.remove('hidden');
      document.querySelector('body').style.overflow = 'hidden';
    }

    const closeModal = function () {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
      document.querySelector('body').style.overflow = 'auto';
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
  }

  formModalInit('sendResumeForm', '.form-modal-close', '.onSendResumeFormOpen');
  formModalInit('partnershipForm', '.form-modal-close', '.onPartnershipForm');
  formModalInit('thankYouModal', '.modal-thank-you-close', '.onThankYouModal');

  function submitForm (formId) {
    document.querySelector(`${formId} form`).addEventListener('submit', function (e) {
      console.log(formId)
      e.preventDefault();
    
      var formData = new FormData(this);
    
      fetch(this.action, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (response.ok) {
          console.log('Success: Form submitted successfully!');
          this.closest(formId).classList.add('hidden');
          document.getElementById('thankYouModal').classList.remove('hidden');
        } else {
          console.log('Error: Form submission failed.');
        }
      })
      .catch(error => console.log('Error:', error));
    });
  }

  submitForm('#sendResumeForm');
  submitForm('#partnershipForm');
})