AFRAME.registerComponent('reef-corals-fragment', {
    init: function() {
      log.debug('Getting template');
        fetch('/reef.html')
      .then(response => response.text())
      .then(html => {
        const template = document.createElement('template');
        template.innerHTML = html;
        template.id = 'reef-corals';
        document.head.appendChild(template);

        if (template) {
          const clone = document.importNode(template.content, true);
          this.el.appendChild(clone);
          log.debug('Cloned template');
        }
      });

    }
  });