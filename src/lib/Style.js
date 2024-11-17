// SideMoveクラス
export class sideMoveCtrl {
    constructor(element, height, duration){
        this.element = element;
        this.height = height;
        this.duration = duration;
        // SideUpとSideDownで共通のプロパティはコンストラクタで設定しておく
        this.element.style.transitionProperty = 'height';
        this.element.style.transitionDuration = this.duration + 'ms';
        this.element.style.transitionTimeFunction = 'ease';
        this.element.style.overflow = 'auto';
    }

    sideUp(){
        this.element.height = '0vh';
        setTimeout(() => {
            this.element.style.display = 'none';
        }, this.duration);
    }

    sideDown(){
        this.element.style.height = this.height;
        this.element.style.display = 'block';
    }

    sideToggle(){
        if (this.element.style.display === 'block'){
            this.sideUp();
        }else{
            this.sideDown();
        }
    }
}

// rotateToggleメソッド
export const rotateToggle = (element, duration=300) => {
    element.style.transitionProperty = 'transform';
    element.style.transitionDuration = duration + 'ms';
    element.style.transitionTimeFunction = 'ease';
    if (element.style.transform === 'rotate(180deg)'){
        element.style.transform = 'rotate(0deg)';
    }else{
        element.style.transform = 'rotate(180deg)';
    }
}