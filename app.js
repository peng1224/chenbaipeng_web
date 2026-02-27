/**
 * 核心动效架构说明：
 * 1. 3D Tilt (3D 倾斜): 模拟物理实体的重心感，增加视觉深度。
 * 2. 物理曲线: 使用 back.out 和 elastic.out 模拟具有惯性的真实物体运动。
 * 3. 视差离场: 通过不同元素的散射速率差异，营造空间层次感。
 * 4. 叙事节奏: 延长 Pin（钉住）时间，确保长文案的阅读停留。
 */

// 监听 DOM 加载完成事件，确保脚本在元素渲染后运行
document.addEventListener('DOMContentLoaded', () => {
  // 注册 GSAP 的滚动触发插件
  gsap.registerPlugin(ScrollTrigger);
  
  // 初始化各个场景的逻辑
  initHeroGsap();    // 第一幕：开场动效
  initHeroTilt();    // 全局/第一幕：3D 鼠标跟随交互
  initRealityGsap(); // 第二幕：医美现实叙事
  initSystemGsap();  // 第三幕：系统化思维
});

/**
 * --- 第一幕：Hero 场景逻辑 ---
 * 负责页面的首次加载入场和初次向下滚动的离场
 */
function initHeroGsap() {
  const title = document.querySelector('.hero-scene .hero-title');
  const orbitItems = gsap.utils.toArray('.hero-scene .orbit-item');
  const blob = document.querySelector('.gradient-blob');

  if (!title) return;

  ScrollTrigger.matchMedia({
    // Desktop: Original Animation
    "(min-width: 769px)": function() {
      // A. [初始化状态]
      gsap.set(title, { scale: 0.85, opacity: 0 });

      // B. [物理入场动画]
      const intro = gsap.timeline({ defaults: { ease: 'back.out(1.2)', duration: 1.2 } });
      intro.to(title, { scale: 1, opacity: 1 }, 0);
      
      orbitItems.forEach((item, i) => {
        let x = 0, y = 0;
        if (item.classList.contains('top')) y = -40;
        if (item.classList.contains('bottom')) y = 40;
        if (item.classList.contains('left')) x = -40;
        if (item.classList.contains('right')) x = 40;
        
        gsap.fromTo(item, 
          { opacity: 0, x, y }, 
          { opacity: 1, x: 0, y: 0, delay: 0.2 + (i * 0.05) }
        );
      });

      // C. [滚动离场动画]
      gsap.timeline({
        scrollTrigger: {
          trigger: '.hero-scene',
          start: 'top top',
          end: '+=100%',
          scrub: 1.2
        }
      })
      .to(title, { 
        y: -100,
        scale: 1.4,
        opacity: 0, 
        filter: 'blur(12px)'
      }, 0)
      .to(orbitItems, { 
        x: (i, el) => el.classList.contains('left') ? -150 : el.classList.contains('right') ? 150 : 0,
        y: (i, el) => el.classList.contains('top') ? -150 : el.classList.contains('bottom') ? 150 : 0,
        opacity: 0,
        scale: 0.5,
        duration: 0.8
      }, 0)
      .to(blob, { scale: 0.3, opacity: 0 }, 0);
    },

    // Mobile: Disabled Animation (Static Layout)
    "(max-width: 768px)": function() {
      // Intentionally left empty to allow CSS static layout
    }
  });
}

/**
 * --- 医美实习片段 ---
 */
function initHeroTilt() {
  // 仅在桌面端 (宽度 > 768px) 启用 3D 倾斜效果
  if (window.matchMedia("(max-width: 768px)").matches) return;

  const container = document.querySelector('.hero-scene');
  const target = document.querySelector('.hero-scene .hero-title');
  if (!container || !target) return;

  container.addEventListener('mousemove', (e) => {
    // 获取容器相对于视口的位置
    const { width, height, left, top } = container.getBoundingClientRect();
    
    // 将鼠标坐标转化为中心坐标系 (-0.5 到 0.5)
    const x = (e.clientX - left) / width - 0.5; 
    const y = (e.clientY - top) / height - 0.5;

    // 平滑插值：限制最大旋转角度为 7度（x/y映射关系需注意：Y轴移动影响X轴旋转）
    gsap.to(target, {
      rotateY: x * 14,      // 左右倾斜
      rotateX: -y * 14,     // 上下倾斜
      ease: 'power2.out',   // power2 追踪鼠标更丝滑
      duration: 0.6,
      overwrite: 'auto'     // 避免新旧动画冲突
    });
  });

  // 鼠标离开容器：优雅复位
  container.addEventListener('mouseleave', () => {
    gsap.to(target, { 
      rotateX: 0, 
      rotateY: 0, 
      duration: 1.2, 
      ease: 'elastic.out(1, 0.3)' // 使用弹簧曲线，产生自然的晃动复位感
    });
  });
}

/**
 * --- 第二幕：Reality 叙事场景 ---
 * 采用 Pin（滚动钉住）技术实现长白文本的沉浸式阅读
 */
function initRealityGsap() {
  const scene = document.querySelector('.reality-scene');
  if (!scene) return;

  const title = scene.querySelector('.hero-title');
  const orbitItems = gsap.utils.toArray('.reality-scene .orbit-item');
  const narrative = scene.querySelector('.narrative-body');
  const paras = gsap.utils.toArray('.reality-scene p');
  const verbs = scene.querySelectorAll('.verb');

  ScrollTrigger.matchMedia({
    // Desktop: Pinned Narrative
    "(min-width: 769px)": function() {
      // 初始化
      gsap.set([title, orbitItems, narrative], { opacity: 0 });
      gsap.set(paras, { y: 30, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: true
        }
      });

      // A. [背景与标题进入]
      tl.to(document.body, { backgroundColor: scene.dataset.bg, duration: 0.2 }, 0)
        .to(title, { opacity: 1, scale: 1, duration: 0.8 }, 0)
        .to(orbitItems, { opacity: 1, stagger: 0.1, duration: 0.8 }, 0.2)
        
        // B. [叙事层级展现]
        .to(title, { y: -60, duration: 1 }, 1)
        .to(narrative, { opacity: 1, duration: 0.5 }, 1)
        .to(paras, { 
          opacity: 1, 
          y: 0, 
          stagger: 0.6,
          duration: 0.2 
        }, 1.2)
        
        // C. [停顿留白]
        .to({}, { duration: 0.5 }, ">")
        
        // D. [流光交互]
        .to(verbs, { 
          textShadow: "0 0 15px rgba(0,122,255,0.4)",
          color: "#007AFF", 
          duration: 0.8 
        }, 2)
        
        // E. [慢速退场]
        .to([title, orbitItems, narrative], { 
          opacity: 0, 
          y: -40, 
          filter: 'blur(8px)', 
          duration: 1.5 
        }, 3.5);
    },

    // Mobile: Disabled Animation (Static Layout)
    "(max-width: 768px)": function() {
      // Intentionally left empty to allow CSS static layout
    }
  });
}

/**
 * --- 第三幕：System Scene (System Builder) ---
 * 表现从传统业务向系统化编程思维的转变
 * 核心：激光切割入场 -> 网格背景 -> 节点高亮 -> 引擎坍缩离场
 */
function initSystemGsap() {
  const path = document.querySelector('#lifePath');
  const steps = gsap.utils.toArray('.step-item');
  const pathLength = path ? path.getTotalLength() : 0;
  
  if (path) {
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
  }

  ScrollTrigger.matchMedia({
    // Desktop: Original Animation with SVG Path
    "(min-width: 769px)": function() {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".system-scene",
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 1
        }
      });

      // 1. 绘制到 Step 1
      tl.to(path, { strokeDashoffset: pathLength * 0.78, duration: 1, ease: "none" })
        .to(steps[0], { opacity: 1, y: 0, duration: 0.5 }, "<50%");

      // 2. 绘制到 Step 2
      tl.to(path, { strokeDashoffset: pathLength * 0.42, duration: 1, ease: "none" })
        .to(steps[1], { opacity: 1, y: 0, duration: 0.5 }, "<50%");

      // 3. 绘制到 Step 3
      tl.to(path, { strokeDashoffset: pathLength * 0.12, duration: 1, ease: "none" })
        .to(steps[2], { opacity: 1, y: 0, duration: 0.5 }, "<50%")
        .to({}, { duration: 0.5 }); 

      // 4. 下坠与离场
      tl.to(path, { strokeDashoffset: 0, duration: 0.6, ease: "power2.in" }, "drop")
        .to([steps[0], steps[1], steps[2]], { 
          y: 1000, 
          opacity: 0, 
          rotation: 15, 
          stagger: 0.1, 
          duration: 1.2, 
          ease: "power4.in" 
        }, "drop")
        .to(steps[3], { opacity: 1, scale: 1, duration: 0.8 }, "drop+=0.4");
    },

    // Mobile: Disabled Animation (Static Layout)
    "(max-width: 768px)": function() {
      // Intentionally left empty to allow CSS static layout
    }
  });
}


/**
 * --- Beesnap历程：完整叙事逻辑 ---
 * 极致简约版：删除多余装饰，聚焦文字情感
 */
function initBeesnapGsap() {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({
    // Desktop: Pinned Storytelling
    "(min-width: 769px)": function() {
      // 初始状态隐藏
      gsap.set(".beesnap-phase", { autoAlpha: 0, visibility: "hidden" });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".beesnap-scene",
          start: "top top",
          end: "+=500%", 
          pin: true,
          scrub: 0.8,
          anticipatePin: 1
        }
      });

      // --- 0. Intro: 序幕 ---
      tl.to(".phase-intro", { autoAlpha: 1, duration: 1 })
        .to(".phase-intro", { autoAlpha: 0, y: -20, duration: 1 }, "+=1.2")

      // --- 1. ACT 01: 播种 ---
      .to(".phase-1", { autoAlpha: 1, y: 0, duration: 1 }, "-=0.2")
        .to(".phase-1", { autoAlpha: 0, scale: 0.95, y: -20, duration: 1 }, "+=1.2")

      // --- 2. ACT 02: 碰撞 ---
      .to(".phase-2", { autoAlpha: 1, scale: 1, duration: 1 }, "<0.2")
        .to(".social-mesh", { opacity: 0.15, duration: 1 }, "<")
        .to(".phase-2", { autoAlpha: 0, y: -20, duration: 0.8 }, "+=1.5") 

      // --- 3. ACT 03: 围城 ---
      .to(".phase-3", { autoAlpha: 1, duration: 1 }, "<0.4") 
        .from(".node", { scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.8 }, "<") 
        .from(".matrix-lines path", { strokeDasharray: 300, strokeDashoffset: 300, duration: 1.5 }, "<")
        .to(".social-mesh", { opacity: 0.4, backgroundSize: "30px 30px", duration: 2 }, "+=0.5")
        .to(".v2-matrix", { filter: "grayscale(100%) opacity(0.2)", scale: 0.98, duration: 2 }, "<")

      // --- 4. Outro: 终章 (纯净复盘) ---
      .to(".phase-3", { autoAlpha: 0, duration: 1 }, "+=0.8")
        // 结尾文字平滑入场，背景网格几乎消失
        .fromTo(".phase-outro", 
          { autoAlpha: 0, y: 30 }, 
          { autoAlpha: 1, y: 0, duration: 1.5 }, 
          "<"
        )
        .to(".social-mesh", { opacity: 0.05, duration: 2 }, "<"); 

      // 结尾停留片刻，给观众思考的空间
      tl.to({}, { duration: 1.5 });
    },

    // Mobile: Disabled Animation (Static Layout)
    "(max-width: 768px)": function() {
      // Intentionally left empty to allow CSS static layout
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector('.beesnap-scene')) {
    initBeesnapGsap();
  }
});






function initResonance() {
    ScrollTrigger.matchMedia({
        // Desktop: Pinned Gallery Experience
        "(min-width: 769px)": function() {
            const mainTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scene-resonance",
                    start: "top top",
                    end: "+=2000", // 明确指定滚动距离
                    scrub: 1,
                    pin: true
                }
            });

            // 1. Layer-1 进入与退出
            mainTl.to(".layer-1", { autoAlpha: 1, duration: 1 })
                  .to(".layer-1", { y: -50, autoAlpha: 0, duration: 1 }, "+=1");

            // 2. Layer-2 画廊阶段
            mainTl.to(".layer-2", { autoAlpha: 1, duration: 1 });

            // 内部切换：滚动时，线框向上移动，文字对应激活
            mainTl.to(".wireframe-scroll-container", {
                y: "-50%", // 根据内容高度调整
                duration: 3, // 缩短持续时间，使滚动更快到达底部
                ease: "none"
            });

            // 3. Layer-2 退出，Layer-3 收束
            mainTl.to(".layer-2", { autoAlpha: 0, scale: 0.95, duration: 1 }, "+=1")
                  .to(".layer-3", { autoAlpha: 1, duration: 1 })
                  .from(".final-text p", { 
                      y: 80, 
                      autoAlpha: 0, 
                      stagger: 0.3, 
                      filter: "blur(10px)", 
                      duration: 1.5 
                  });
        },

        // Mobile: Disabled Animation (Static Layout)
    "(max-width: 768px)": function() {
      // Intentionally left empty to allow CSS static layout
    }
    });
}

window.addEventListener("load", initResonance);


