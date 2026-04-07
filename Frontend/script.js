gsap.registerPlugin(ScrollTrigger);

const frameCount = 240;
const canvas = document.getElementById("canvas");
const context = canvas ? canvas.getContext("2d") : null;
const loader = document.getElementById("loader");
const box1 = document.getElementById("box1");
const box2 = document.getElementById("box2");
const frameWrap = document.querySelector(".frame-wrap");
const aboutTag = document.querySelector(".about-tag");
const aboutCards = gsap.utils.toArray(".about-card");
const colorBlend = document.querySelector(".color-blend");

const images = [];
const imageSeq = { frame: 0 };

let loadedCount = 0;
let animationStarted = false;
let activeBox1 = false;
let activeBox2 = false;

function currentFrame(index) {
  return `zip/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;
}

function resizeCanvas() {
  if (!canvas || !context) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(dpr, dpr);
  render();
}

function drawImageCover(img) {
  if (!context || !img || !img.naturalWidth) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih);
  const x = (cw - iw * scale) / 2;
  const y = (ch - ih * scale) / 2;

  context.clearRect(0, 0, cw, ch);
  context.drawImage(img, x, y, iw * scale, ih * scale);
}

function showBox(el, direction, isCentered = false) {
  if (!el) return;

  const xOffset = direction === "left" ? -30 : 30;

  gsap.fromTo(
    el,
    {
      opacity: 0,
      x: xOffset,
      yPercent: isCentered ? -50 : 0,
      scale: 0.96
    },
    {
      opacity: 1,
      x: 0,
      yPercent: isCentered ? -50 : 0,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
      overwrite: true
    }
  );
}

function hideBox(el, direction, isCentered = false) {
  if (!el) return;

  const xOffset = direction === "left" ? -30 : 30;

  gsap.to(el, {
    opacity: 0,
    x: xOffset,
    yPercent: isCentered ? -50 : 0,
    scale: 0.96,
    duration: 0.32,
    ease: "power2.out",
    overwrite: true
  });
}

function handleTextAnimation(frame) {
  const showFirst = frame >= 50 && frame <= 80;
  const showSecond = frame >= 120 && frame <= 160;

  if (showFirst && !activeBox1) {
    activeBox1 = true;
    showBox(box1, "left", true);
  } else if (!showFirst && activeBox1) {
    activeBox1 = false;
    hideBox(box1, "left", true);
  }

  if (showSecond && !activeBox2) {
    activeBox2 = true;
    showBox(box2, "right", true);
  } else if (!showSecond && activeBox2) {
    activeBox2 = false;
    hideBox(box2, "right", true);
  }
}

function render() {
  const img = images[Math.round(imageSeq.frame)];
  if (!img || !img.complete || !img.naturalWidth) return;

  drawImageCover(img);
  handleTextAnimation(Math.round(imageSeq.frame));
}

function createSectionReveal() {
  if (!aboutTag || !aboutCards.length || !frameWrap || !colorBlend) return;

  gsap.set(aboutTag, {
    opacity: 0,
    y: 26
  });

  gsap.set(aboutCards, {
    opacity: 0,
    y: 40
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: ".color-blend",
      start: "top 92%",
      end: "bottom 35%",
      scrub: 1.4
    }
  })
    .to(frameWrap, {
      scale: 1.012,
      ease: "none"
    }, 0)
    .to(colorBlend, {
      opacity: 1,
      ease: "none"
    }, 0)
    .to(aboutTag, {
      opacity: 1,
      y: 0,
      ease: "none"
    }, 0.45)
    .to(aboutCards, {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      ease: "none"
    }, 0.55);
}

function createWorkflowAnimations() {
  const workflowTag = document.querySelector(".workflow-tag");
  const workflowTitle = document.querySelector(".workflow-header h2");
  const workflowText = document.querySelector(".workflow-header p");
  const workflowSteps = gsap.utils.toArray(".workflow-step");
  const workflowProgress =
    document.getElementById("workflowProgress") ||
    document.querySelector(".workflow-progress");
  const workflowTimeline = document.querySelector(".workflow-timeline");
  const workflowSection = document.querySelector(".workflow-section");

  if (!workflowSection || !workflowTimeline) return;

  if (workflowTag) {
    gsap.set(workflowTag, {
      opacity: 0,
      y: 24
    });
  }

  if (workflowTitle) {
    gsap.set(workflowTitle, {
      opacity: 0,
      y: 28
    });
  }

  if (workflowText) {
    gsap.set(workflowText, {
      opacity: 0,
      y: 28
    });
  }

  if (workflowSteps.length) {
    gsap.set(workflowSteps, {
      opacity: 0,
      y: 60
    });
  }

  if (workflowProgress) {
    gsap.fromTo(
      workflowProgress,
      {
        height: 0
      },
      {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: workflowTimeline,
          start: "top 75%",
          end: "bottom 80%",
          scrub: 1.2
        }
      }
    );
  }

  if (workflowTag) {
    gsap.to(workflowTag, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: workflowSection,
        start: "top 78%"
      }
    });
  }

  if (workflowTitle) {
    gsap.to(workflowTitle, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: workflowSection,
        start: "top 72%"
      }
    });
  }

  if (workflowText) {
    gsap.to(workflowText, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: workflowSection,
        start: "top 70%"
      }
    });
  }

  workflowSteps.forEach((step, index) => {
    gsap.to(step, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: index * 0.05,
      scrollTrigger: {
        trigger: step,
        start: "top 82%"
      }
    });
  });
}

function createFooterAnimations() {
  const footerBrand = document.querySelector(".footer-brand");
  const footerText = document.querySelector(".footer-text");
  const footerColumns = gsap.utils.toArray(".footer-column");
  const footerBottom = document.querySelector(".footer-bottom");
  const siteFooter = document.querySelector(".site-footer");

  if (!siteFooter) return;

  gsap.set(".footer-brand, .footer-text, .footer-column, .footer-bottom", {
    opacity: 0,
    y: 30
  });

  if (footerBrand) {
    gsap.to(footerBrand, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: siteFooter,
        start: "top 82%"
      }
    });
  }

  if (footerText) {
    gsap.to(footerText, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: siteFooter,
        start: "top 78%"
      }
    });
  }

  if (footerColumns.length) {
    gsap.to(footerColumns, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: siteFooter,
        start: "top 76%"
      }
    });
  }

  if (footerBottom) {
    gsap.to(footerBottom, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: footerBottom,
        start: "top 92%"
      }
    });
  }
}

function initNavDot() {
  const navLinks = document.querySelectorAll(".nav-right a");
  const dot = document.querySelector(".nav-dot");
  const navRight = document.querySelector(".nav-right");

  if (!navLinks.length || !dot || !navRight) return;

  function moveDot(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const parentRect = navRight.getBoundingClientRect();
    dot.style.left =
      rect.left - parentRect.left + rect.width / 2 - dot.offsetWidth / 2 + "px";
  }

  navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      moveDot(link);
    });

    link.addEventListener("click", () => {
      const currentActive = document.querySelector(".nav-right .active");
      if (currentActive) currentActive.classList.remove("active");
      link.classList.add("active");
      moveDot(link);
    });
  });

  navRight.addEventListener("mouseleave", () => {
    const active = document.querySelector(".nav-right .active") || navLinks[0];
    moveDot(active);
  });

  window.addEventListener("load", () => {
    const active = document.querySelector(".nav-right .active") || navLinks[0];
    moveDot(active);
  });

  window.addEventListener("resize", () => {
    const active = document.querySelector(".nav-right .active") || navLinks[0];
    moveDot(active);
  });
}

function startAnimation() {
  if (animationStarted) return;
  animationStarted = true;

  if (loader) {
    loader.style.display = "none";
  }

  imageSeq.frame = 0;
  render();

  gsap.fromTo(
    ".nav-shell",
    { y: -30, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
  );

  if (canvas && context) {
    gsap.to(imageSeq, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: render,
      scrollTrigger: {
        trigger: ".homepage",
        start: "top top",
        end: `+=${frameCount * 18}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
  }

  createSectionReveal();
  createWorkflowAnimations();
  createFooterAnimations();

  ScrollTrigger.refresh();
}

function preloadImages() {
  if (!canvas || !context) {
    startAnimation();
    return;
  }

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();

    img.onload = () => {
      loadedCount++;
      if (loader) {
        loader.textContent = `Loading ${Math.round((loadedCount / frameCount) * 100)}%`;
      }

      if (i === 1) {
        resizeCanvas();
        drawImageCover(img);
      }

      if (loadedCount === frameCount) {
        startAnimation();
      }
    };

    img.onerror = () => {
      loadedCount++;
      if (loader) {
        loader.textContent = `Loading ${Math.round((loadedCount / frameCount) * 100)}%`;
      }
      console.log("Failed:", currentFrame(i));

      if (loadedCount === frameCount) {
        startAnimation();
      }
    };

    img.src = currentFrame(i);
    images.push(img);
  }
}

window.addEventListener("resize", () => {
  resizeCanvas();
  ScrollTrigger.refresh();
});

initNavDot();
preloadImages();