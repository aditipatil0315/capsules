// src/main.js (REPLACEMENT)
import { setupMarqueeAnimation } from "./counter.js";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on("scroll", ScrollTrigger.update);
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  const cards = gsap.utils.toArray(".card");
  if (!cards || cards.length === 0) return;

  const introCard = cards[0];
  if (!introCard) return;

  // Split titles into chars
  const titles = gsap.utils.toArray(".card-title h1");
  titles.forEach((title) => {
    const split = new SplitText(title, {
      type: "char",
      charsClass: "char",
      tag: "div",
    });

    split.chars.forEach((char) => {
      char.innerHTML = `<span aria-hidden="true">${char.textContent}</span>`;
    });
  });

  const cardImgWrapper = introCard.querySelector(".card-img");
  const cardImg = introCard.querySelector(".card-img img");
  if (cardImgWrapper) gsap.set(cardImgWrapper, { scale: 0.5, borderRadius: "400px" });
  if (cardImg) gsap.set(cardImg, { scale: 0.5 , borderRadius: "400px"});


  function animateContentIn(titleChars, description) {
    if (titleChars && titleChars.length !== 0) {
      gsap.to(titleChars, { x: "0%", duration: 0.75, ease: "power4.out", stagger: 0.09 });
    }
    if (description) {
      gsap.to(description, {
        x: 0,
        opacity: 1,
        duration: 0.75,
        delay: 0.1,
        ease: "power4.out",
      });
    }
  }

  function animateContentOut(titleChars, description) {

    if (titleChars && titleChars.length !== 0) {
      gsap.to(titleChars, { x: "-100%", duration: 0.6, ease: "power4.in", stagger: 0.01 });
    }
    if (description) {
      gsap.to(description, { x: 20, opacity: 0, duration: 0.6, ease: "power4.in" });
    }
  }


  const marquee = introCard.querySelector(".card-marquee .marquee");
  const titleChars = introCard.querySelectorAll(".card-title .char span"); // NodeList
  const description = introCard.querySelector(".card-description");


  ScrollTrigger.create({
    trigger: introCard,
    start: "top top",
    end: "+=300vh",
    onUpdate: (self) => {
      try {
        const progress = self.progress;
        const imgScale = 0.5 + progress * 0.5;
        const borderRadius = 400 - progress * 375;
        const innerImgScale = 1.5 - progress * 0.5;

        if (cardImgWrapper) {
          gsap.set(cardImgWrapper, {
            scale: imgScale,
            borderRadius: borderRadius + "px",
          });
        }
        if (cardImg) gsap.set(cardImg, { scale: innerImgScale });


        if (marquee) {
          if (imgScale >= 0.5 && imgScale <= 0.75) {
            const fadeProgress = (imgScale - 0.5) / (0.75 - 0.5);
            gsap.set(marquee, { opacity: 1 - fadeProgress });
          } else if (imgScale < 0.5) {
            gsap.set(marquee, { opacity: 1 });
          } else if (imgScale > 0.75) {
            gsap.set(marquee, { opacity: 0 });
          }
        }


        if (progress >= 1 && !introCard.contentRevealed) {
          introCard.contentRevealed = true;
          animateContentIn(titleChars, description);
        }

        if (progress < 1 && introCard.contentRevealed) {
          introCard.contentRevealed = false;
          animateContentOut(titleChars, description);
        }
      } catch (err) {

        console.error("introCard ScrollTrigger error:", err);
      }
    },
  });


  cards.forEach((card, index) => {
    const isLastCard = index === cards.length - 1;
    ScrollTrigger.create({
      trigger: card,
      start: "top top",
      end: isLastCard ? "+=100vh" : "top top",
      endTrigger: isLastCard ? null : cards[cards.length - 1],
      pin: true,
      pinSpacing: isLastCard,
    });
  });


  cards.forEach((card, index) => {
    if (index < cards.length - 1) {
      const next = cards[index + 1];
      ScrollTrigger.create({
        trigger: next,
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          try {
            const progress = self.progress;
            if (cardImgWrapper) {

              gsap.set(cardImgWrapper, {
                scale: 1 - progress * 0.25,
                opacity: 1 - progress,
              });
            }
          } catch (err) {
            console.error("img progress update error:", err);
          }
        },
      });
    }
  });

  // per-card image scale / borderRadius transitions
  cards.forEach((card, index) => {
    if (index === 0) return;

    const cardImg = card.querySelector(".card-img img");
    const imgContainer = card.querySelector(".card-img");
    ScrollTrigger.create({
      trigger: card,
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => {
        try {
          const progress = self.progress;
          if (cardImg) gsap.set(cardImg, { scale: 2 - progress });
          if (imgContainer) gsap.set(imgContainer, { borderRadius: 150 - progress * 125 + "px" });
        } catch (err) {
          console.error("card image update error:", err);
        }
      },
    });
  });

  // animate title & description on entering each card
  cards.forEach((card, index) => {
    if (index === 0) return;

    const cardDescription = card.querySelector(".card-description"); // fixed selector
    const cardTitleChars = card.querySelectorAll(".char span");

    ScrollTrigger.create({
      trigger: card,
      start: "top top",
      onEnter: () => {
        try {
          animateContentIn(cardTitleChars, cardDescription);
        } catch (err) {
          console.error("onEnter animate error:", err);
        }
      },
      onLeaveBack: () => {
        try {
          animateContentOut(cardTitleChars, cardDescription);
        } catch (err) {
          console.error("onLeaveBack animate error:", err);
        }
      },
    });
  });

  // finally setup marquee animation (in counter.js) and refresh ScrollTrigger
  setupMarqueeAnimation();

  // small safety: recalc after setup
  ScrollTrigger.refresh();
});
