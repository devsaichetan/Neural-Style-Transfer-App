(function() {
  'use strict';

  // -------- particles (floating neural network) --------
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  const COUNT = 80;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 1.5 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.5
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, w, h);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 160, 255, ${p.alpha})`;
      ctx.shadowColor = '#4f7dff';
      ctx.shadowBlur = 18;
      ctx.fill();
    }

    // draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = 0.12 * (1 - dist / 140);
          ctx.strokeStyle = `rgba(90, 150, 255, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // -------- UI: upload cards + previews --------
  const contentInput = document.getElementById('contentInput');
  const styleInput = document.getElementById('styleInput');
  const contentPreview = document.getElementById('contentPreview');
  const stylePreview = document.getElementById('stylePreview');
  const contentPlaceholder = document.getElementById('contentPlaceholder');
  const stylePlaceholder = document.getElementById('stylePlaceholder');
  const contentDrop = document.getElementById('contentDrop');
  const styleDrop = document.getElementById('styleDrop');

  function handleFile(input, previewImg, placeholder, card) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.classList.remove('hidden');
      placeholder.classList.add('hidden');
      card.classList.add('glow');
    };
    reader.readAsDataURL(file);
  }

  contentInput.addEventListener('change', function() {
    handleFile(this, contentPreview, contentPlaceholder, contentDrop);
  });

  styleInput.addEventListener('change', function() {
    handleFile(this, stylePreview, stylePlaceholder, styleDrop);
  });

  // drag-and-drop events
  function setupDropZone(dropEl, inputEl, previewEl, placeholderEl, card) {
    dropEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropEl.style.borderColor = '#b7d0ff';
      dropEl.style.background = 'rgba(30, 60, 120, 0.3)';
    });

    dropEl.addEventListener('dragleave', () => {
      dropEl.style.borderColor = 'rgba(79,125,255,0.5)';
      dropEl.style.background = 'rgba(10,16,30,0.5)';
    });

    dropEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropEl.style.borderColor = 'rgba(79,125,255,0.5)';
      dropEl.style.background = 'rgba(10,16,30,0.5)';

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        inputEl.files = files;
        const event = new Event('change', { bubbles: true });
        inputEl.dispatchEvent(event);
      }
    });

    // click on card triggers input
    dropEl.addEventListener('click', () => inputEl.click());
  }

  setupDropZone(contentDrop, contentInput, contentPreview, contentPlaceholder, contentDrop);
  setupDropZone(styleDrop, styleInput, stylePreview, stylePlaceholder, styleDrop);

  // -------- form submission: loading state, results handling --------
  const form = document.getElementById('styleForm');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const resultsSection = document.getElementById('resultsSection');
  const resultContentImg = document.getElementById('resultContentImg');
  const resultStyleImg = document.getElementById('resultStyleImg');
  const resultOutputImg = document.getElementById('resultOutputImg');
  const downloadLink = document.getElementById('downloadLink');

  // capture previews for results
  function setResultImages() {
    if (contentPreview.src && !contentPreview.classList.contains('hidden')) {
      resultContentImg.src = contentPreview.src;
    } else {
      resultContentImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23141b2b" width="200" height="200"/%3E%3Ctext x="50" y="110" fill="%235a7ab5" font-family="Inter" font-size="16"%3Eno content%3C/text%3E%3C/svg%3E';
    }

    if (stylePreview.src && !stylePreview.classList.contains('hidden')) {
      resultStyleImg.src = stylePreview.src;
    } else {
      resultStyleImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23141b2b" width="200" height="200"/%3E%3Ctext x="55" y="110" fill="%235a7ab5" font-family="Inter" font-size="16"%3Eno style%3C/text%3E%3C/svg%3E';
    }
  }

  // handle form submission with fetch (preserve backend)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // validate files
    if (!contentInput.files[0] || !styleInput.files[0]) {
      alert('Please upload both a Content and a Style image.');
      return;
    }

    // show loading
    generateBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const html = await response.text();

      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Look for the result image - using multiple strategies
      let resultSrc = null;

      // Strategy 1: Look for img with src containing 'result' or 'stylized' or base64
      const allImages = tempDiv.querySelectorAll('img');
      for (let img of allImages) {
        const src = img.getAttribute('src');
        if (src && (
          src.includes('result') ||
          src.includes('stylized') ||
          src.includes('output') ||
          src.includes('data:image')
        )) {
          // Check if this is likely the output image (not content or style)
          const alt = img.getAttribute('alt') || '';
          const parentText = img.parentElement ? img.parentElement.textContent : '';
          if (
            alt.toLowerCase().includes('stylized') ||
            alt.toLowerCase().includes('output') ||
            alt.toLowerCase().includes('result') ||
            parentText.toLowerCase().includes('stylized') ||
            parentText.toLowerCase().includes('output') ||
            parentText.toLowerCase().includes('result')
          ) {
            resultSrc = src;
            break;
          }
        }
      }

      // Strategy 2: If not found, look for any img with data:image (likely the result)
      if (!resultSrc) {
        for (let img of allImages) {
          const src = img.getAttribute('src');
          if (src && src.startsWith('data:image')) {
            resultSrc = src;
            break;
          }
        }
      }

      // Strategy 3: Look for the result_image placeholder pattern
      if (!resultSrc) {
        const match = html.match(/result_image['"]?\s*:\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          resultSrc = match[1];
        }
      }

      // Strategy 4: Look for any image in the response (last resort)
      if (!resultSrc) {
        const lastImg = allImages[allImages.length - 1];
        if (lastImg && lastImg.getAttribute('src')) {
          resultSrc = lastImg.getAttribute('src');
        }
      }

      // set result images (content and style previews)
      setResultImages();

      if (resultSrc) {
        // Set the output image
        resultOutputImg.src = resultSrc;
        resultOutputImg.classList.remove('fade-in');
        void resultOutputImg.offsetWidth; // force reflow
        resultOutputImg.classList.add('fade-in');

        // Set download link
        downloadLink.href = resultSrc;

        // Show results
        resultsSection.classList.remove('hidden');

        // Scroll to results
        resultsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // If no result found, check if there's a message in the response
        const bodyText = tempDiv.textContent || '';
        if (bodyText.includes('error') || bodyText.includes('Error')) {
          alert('Error generating artwork. Please try again.');
        } else {
          alert('Output image not found in response. Please check the server logs.');
        }
        console.error('No result image found in response. HTML preview:', html.substring(0, 500));
      }

    } catch (err) {
      console.error('Error:', err);
      alert('Error during generation. Please check console for details.');
    } finally {
      generateBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  });

  // initial state
  resultsSection.classList.add('hidden');
  setResultImages();

  // Handle case where backend returns with result_image on page load
  window.addEventListener('load', function() {
    // Check if there's a result image already in the page (from template)
    const allImgs = document.querySelectorAll('img');
    let foundResult = false;

    for (let img of allImgs) {
      const src = img.getAttribute('src');
      if (src && (
        src.includes('result') ||
        src.includes('stylized') ||
        src.includes('output') ||
        src.includes('data:image')
      )) {
        // Check if this is likely the output image (not content or style)
        const alt = img.getAttribute('alt') || '';
        const parentText = img.parentElement ? img.parentElement.textContent : '';
        if (
          alt.toLowerCase().includes('stylized') ||
          alt.toLowerCase().includes('output') ||
          alt.toLowerCase().includes('result') ||
          parentText.toLowerCase().includes('stylized') ||
          parentText.toLowerCase().includes('output') ||
          parentText.toLowerCase().includes('result')
        ) {
          resultOutputImg.src = src;
          downloadLink.href = src;
          foundResult = true;
          resultsSection.classList.remove('hidden');
          resultOutputImg.classList.remove('fade-in');
          void resultOutputImg.offsetWidth;
          resultOutputImg.classList.add('fade-in');
          break;
        }
      }
    }

    // If no result found but there's a data:image, use it
    if (!foundResult) {
      for (let img of allImgs) {
        const src = img.getAttribute('src');
        if (src && src.startsWith('data:image') && img.id !== 'contentPreview' && img.id !== 'stylePreview') {
          resultOutputImg.src = src;
          downloadLink.href = src;
          foundResult = true;
          resultsSection.classList.remove('hidden');
          resultOutputImg.classList.remove('fade-in');
          void resultOutputImg.offsetWidth;
          resultOutputImg.classList.add('fade-in');
          break;
        }
      }
    }
  });

  // Keyboard shortcut: Ctrl+Enter to submit
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  console.log('🧠 Neural Style Transfer UI ready');
  console.log('📸 Upload content & style images, then click Generate');
})();