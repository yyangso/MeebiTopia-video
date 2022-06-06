(() => {

    let yOffset = 0; //pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이 값의 합
    let currentScene = 0; //현재 활성화된(눈 앞에 보고 있는) 씬(scroll-section)
    let enterNewScene = false; //새로운 씬이 시작되는 순간 true
    //캔버스 이미지 감속처리 변수
    let acc = 0.1;
    let delayedYOffset = 0;
    let rafId;
    let rafState;

    const sceneInfo = [
        {
            //0
            type: 'sticky',
            heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-0'),
                canvas: document.querySelector('#video-canvas-0'),
                context: document.querySelector('#video-canvas-0').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 300,
                imageSequence: [0, 299],
                canvas_opacity: [1, 0, {start: 0.9, end: 1}]
            }
        },
        {
            //1
            type: 'normal',
            //heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-1'),
                content: document.querySelector('#scroll-section-1 .video-container')
            }
        },
        {
            //2
            type: 'sticky',
            heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-2'),
                canvas: document.querySelector('#video-canvas-1'),
                context: document.querySelector('#video-canvas-1').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 960,
                imageSequence: [0, 959],
                canvas_opacity_in: [0, 1, {start: 0, end: 0.1}],
                canvas_opacity_out: [1, 0, {start: 0.95, end: 1}]
            }
        },
        {
            //3
            type: 'normal',
            // heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-3'),
                content: document.querySelector('.track-box')

            }
        },
        {
            //4
            type: 'normal',
            // heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-4'),
                content: document.querySelector('.mid-message-box','mid-message')
            }
        },
        {
            //5
            type: 'normal',
            // heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-5'),
                content: document.querySelector('.no-message-box','no-message')
            }
        },
        {
            //6
            type: 'normal',
            // heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-6'),
                content: document.querySelector('.slide-box')
            }
        },
        {
            //7
            type: 'normal',
            // heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-7'),
                content: document.querySelector('.question-box','.faq-content'),
                items: document.querySelectorAll('.question')
            }
        },
        {
            //8
            type: 'sticky',
            heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-8'),
                canvas: document.querySelector('#video-canvas-2'),
                context: document.querySelector('#video-canvas-2').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 300,
                imageSequence: [0, 299],
                canvas_opacity_in: [0, 1, {start: 0, end: 0.15}],
                canvas_opacity_out: [1, 0, {start: 0.9, end: 0.98}]
            }
        }
    ];


    function setCanvasImages() {
        let imgElem;
        for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
            imgElem = new Image();
            imgElem.src = `./video/1/IMG_${1 + i}.jpg`;
            sceneInfo[0].objs.videoImages.push(imgElem);
        }
        
        let imgElem2;
        for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
            imgElem2 = new Image();
            imgElem2.src = `./video/2/IMG_${7027 + i}.jpg`;
            sceneInfo[2].objs.videoImages.push(imgElem2);
        }
        let imgElem8;
        for (let i = 0; i < sceneInfo[8].values.videoImageCount; i++) {
            imgElem8 = new Image();
            imgElem8.src = `./video/1/IMG_${1 + i}.jpg`;
            sceneInfo[8].objs.videoImages.push(imgElem8);
        }
    }
    
    function checkMenu() {
        if (yOffset > 44) {
            document.body.classList.add('local-nav-sticky');
        } else {
            document.body.classList.remove('local-nav-sticky');
        }
    }

    function setLayout() {
        //각 스크롤 섹션의 높이 세팅
        for (let i = 0; i < sceneInfo.length; i++) { 
            if (sceneInfo[i].type === 'sticky') {
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight; 
            } else if (sceneInfo[i].type === 'normal') {
                sceneInfo[i].scrollHeight = sceneInfo[i].objs.content.offsetHeight + window.innerHeight * 0.5;
            }
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
  
        }

        yOffset = window.pageYOffset;

        let totalScrollHeight = 0;
        for (let i = 0; i < sceneInfo.length; i++) {
            totalScrollHeight += sceneInfo[i].scrollHeight;
            if (totalScrollHeight >= yOffset) {
                currentScene = i;
                break;
            }
            
        }
        document.body.setAttribute('id', `show-scene-${currentScene}`);
        
        const heightRatio = window.innerHeight / 1080;
        console.log(heightRatio);
        sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(1)`;
        sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(1)`;
        sceneInfo[8].objs.canvas.style.transform = `translate3d(-50%, -55%, 0) scale(1)`;
        
    }


    
    function calcValues(values, currentYOffset) {
        let rv;
        //현재 스크롤 섹션에서 스크롤된 범위 비율로 구하기
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;

        if (values.length === 3) {
            //start ~ end 사이에 애니메이션 실행
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd - partScrollStart;

            if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
                rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) +values[0];
            } else if (currentYOffset < partScrollStart) {
                rv = values[0];
            } else if (currentYOffset > partScrollEnd) {
                rv = values[1];
            }
        } else {
            rv = scrollRatio * (values[1] - values[0]) + values[0];
        }

        return rv;

    }

    function makeClone() {
        var slides = document.querySelector('.slide-track');
        var slide = document.querySelectorAll('.slide');
        var slideCount = slide.length;
        var slides1 = document.querySelector('.slide-mbits');
        var slide1 = document.querySelectorAll('.mbits');
        var slideCount1 = slide1.length;
        var slides2 = document.querySelector('.slide-rtl');
        var slide2 = document.querySelectorAll('.rtl');
        var slideCount2 = slide2.length;
    
        for(var i = 0; i < slideCount; i++) {
            //a.cloneNode() : a 요소 복사 , a.cloneNode(true) : a의 자식요소까지 모두 복사
            var cloneSlide = slide[i].cloneNode(true);
            cloneSlide.classList.add('clone');
            //a.appendChild(b) : a 요소 뒤에 b를 추가
            slides.appendChild(cloneSlide);
        }
        for(var i = slideCount -1; i >= 0; i--) {
            var cloneSlide = slide[i].cloneNode(true);
            cloneSlide.classList.add('clone');
            //a.prepend(b) : a 요소 앞에 b를 추가
            slides.prepend(cloneSlide);
        }
        for(var i = slideCount1 -1; i >= 0; i--) {
            var cloneSlide1 = slide1[i].cloneNode(true);
            cloneSlide1.classList.add('clone');
            //a.prepend(b) : a 요소 앞에 b를 추가
            slides1.prepend(cloneSlide1);
        }
        for(var i = slideCount1 -1; i >= 0; i--) {
            var cloneSlide1 = slide1[i].cloneNode(true);
            cloneSlide1.classList.add('clone');
            //a.prepend(b) : a 요소 앞에 b를 추가
            slides1.prepend(cloneSlide1);
        }
        for(var i = slideCount2 -1; i >= 0; i--) {
            var cloneSlide2 = slide2[i].cloneNode(true);
            cloneSlide2.classList.add('clone');
            //a.prepend(b) : a 요소 앞에 b를 추가
            slides2.prepend(cloneSlide2);
        }
        for(var i = slideCount2 -1; i >= 0; i--) {
            var cloneSlide2 = slide2[i].cloneNode(true);
            cloneSlide2.classList.add('clone');
            //a.prepend(b) : a 요소 앞에 b를 추가
            slides2.prepend(cloneSlide2);
        }
    }
    makeClone();
    
    function playAnimation() {
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;
        const currentYOffset = yOffset - prevScrollHeight;
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;

       
        switch (currentScene) {
            case 0:
                //console.log('0 play');
                //let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                //objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                objs.canvas.style.opacity = calcValues(values.canvas_opacity, currentYOffset);

                break;

            case 2:
                //console.log('2 play');
                //let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
                //objs.context.drawImage(objs.videoImages[sequence2], 0, 0);
                // currentScene 3에서 쓰는 캔버스를 미리 그려주기 시작
                if (scrollRatio <= 0.5) {
					// in
					objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
				} else {
					// out
					objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
				}          
                break;

            case 8:
                if (scrollRatio <= 0.5) {
					// in
					objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
				} else {
					// out
					objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
				} 
                break;
        }
    }
    function openCloseAnswer() {
        const answerId = this.id.replace('que', 'ans');

        if(document.getElementById(answerId).style.display === 'block') {
            document.getElementById(answerId).style.display = 'none';
            document.getElementById(this.id + '-toggle').textContent = '+';
        } else {
            document.getElementById(answerId).style.display = 'block';
            document.getElementById(this.id + '-toggle').textContent = '-';
        }
    }

    sceneInfo[7].objs.items.forEach(item => item.addEventListener('click', openCloseAnswer));

    function scrollLoop() {
        enterNewScene = false; 
        prevScrollHeight = 0;
        for (let i = 0; i < currentScene; i++) {
            prevScrollHeight += sceneInfo[i].scrollHeight;
        }
        
        if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            enterNewScene = true;
            currentScene++;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }
        if (delayedYOffset < prevScrollHeight) {
            enterNewScene = true;
            if (currentScene === 0) return; //브라우저 바운스 효과로 마이너스 되는 것 방지(모바일)
            currentScene--;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }
        
        if (enterNewScene) return; //만약 enterNewScene이 true라면 함수를 종료해버린다는 의미.

        playAnimation();
    }

        function loop() {
            delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;
            if (!enterNewScene) { //새로운 씬에 들어가지 않는 순간에 실행
                if (currentScene === 0 || currentScene === 2 || currentScene === 8) {
                    const currentYOffset = delayedYOffset - prevScrollHeight;
                    const objs = sceneInfo[currentScene].objs;
                    const values = sceneInfo[currentScene].values;
                    let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                    if (objs.videoImages[sequence]) {
                        objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                    }
                }
            }

            rafId = requestAnimationFrame(loop);
            

            if (Math.abs(yOffset - delayedYOffset) < 1) {
                cancelAnimationFrame(rafId);
                rafState = false;
            }
        }


    window.addEventListener('load', () => {
        document.body.classList.remove('before-load');
        setLayout();
        sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0); //페이지 열자마자 이미지 로드되어있음

        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            scrollLoop();
            checkMenu();
            //캔버스 이미지 부드러운 감속처리
            if (!rafState) {
                rafId = requestAnimationFrame(loop);
                rafState = true;
            }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                setLayout();
            }
        });  
        
        window.addEventListener('orientationchange', () => {
            setTimeout(setLayout, 500); //모바일 화면 전환시 layout 정렬됨
        });
            document.querySelector('.loading').addEventListener('transitionend', (e) => {
            document.body.removeChild(e.currentTarget);
        });
    }); 
 
    setCanvasImages();

})();
