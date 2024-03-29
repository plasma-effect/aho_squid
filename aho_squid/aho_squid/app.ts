﻿///<reference path="Scripts/typings/jquery/jquery.d.ts" />
class XorShift {
    constructor(private seed: number) {
    }

    public run() {
        this.seed ^= (this.seed << 17);
        this.seed ^= (this.seed >> 9);
        this.seed ^= (this.seed << 8);
        this.seed ^= (this.seed >> 27);
        return this.seed;
    }
}
function make_xorshift(seed: number) {
    var engine = new XorShift(seed);
    return () => {
        return engine.run();
    };
}
function seed_generate() {
    var v = (new Date()).getTime();
    v ^= (v << 19);
    v ^= (v >> 13);
    v ^= (v << 8);
    v ^= (v >> 21);
    return v;
}
var random: Function;

var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

var angle: number;

var ika: HTMLImageElement;
var bg: HTMLImageElement;
var rare: HTMLImageElement;
var title: HTMLImageElement;
var gameover: HTMLImageElement;
var danger: HTMLImageElement;
var raredanger: HTMLImageElement;

var message: HTMLElement;

var data: number[];
var outer: number[];
var left: boolean;
var right: boolean;
var space: boolean;

const speed = 3;
const rect = 240;
const border = 30;
const gameoverline = 70;
const correction = 1;

var score: number;
var counter: number;

function init() {
    var ar = new Array(4);
    ar[0] = random() % 16;
    for (var i = 1; i < 4; ++i) {
        while (true) {
            ar[i] = random() % 16;
            var f = false;
            for (var k = 0; k < i; ++k) {
                if (ar[i] == ar[k]) {
                    f = true;
                    break;
                }
            }
            if (!f)
                break;
        }
    }
    data =
       [0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0];
    for (var i = 0; i < 4;++i) {
        data[ar[i]] = 1;
    }
    outer =
       [0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
            0, 0, 0, 0];
    score = 0;
    counter = 0;
}

function mainloop() {
    var r = random() % 16;
    outer[r] += 1 + data[r] + score / 10000;

    if (right) {
        angle += 360 - speed;
        angle %= 360;
    }
    if (left) {
        angle += speed;
        angle %= 360;
    }

    var target = (16 - Math.floor(angle / 22.5)) % 16;

    if (space && outer[target] >= border) {
        outer[target] = 0;
    }

    ++score;

    var max = 0;
    for (var i = 0; i < outer.length;++i) {
        if (max < outer[i])
            max = outer[i];
    }
    if (max >= border) {
        message.innerText = "烏賊脱出寸前！ score:" + score;
    }
    else {
        message.innerText = "普通　　　　　 score:" + score;
    }
    if (max >= gameoverline) {
        message.innerText = "Game Over 　　 score:" + score;
        return true;
    }

    return false;
}

function ika_draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg, 0, 0);

    for (var i = 0; i < 16; ++i) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(320, 0);
        ctx.rotate((angle + 22.5 * i + 78.25) * Math.PI * 2 / 360);
        ctx.translate(rect + outer[i] / correction, 0);
        if (data[i] == 0 && outer[i] >= border) {
            ctx.drawImage(danger, -80, -40);
        }
        else if (data[i] == 0) {
            ctx.drawImage(ika, -80, -40);
        }
        else if (outer[i] >= border) {
            ctx.drawImage(raredanger, -80, -40);
        }
        else {
            ctx.drawImage(rare, -80, -40);
        }
    }
}

enum mode_t {
    title, game, gameover
}
var mode: mode_t;

function loop() {
    if (mode == mode_t.title) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(title, 0, 0);
        random();
        if (space) {
            init();
            mode = mode_t.game;
        }
    }
    else if (mode == mode_t.game) {
        if (mainloop()) {
            mode = mode_t.gameover;
            var url = "http://plasma-effect.github.io/aho_squid/aho_squid/aho_squid/index.html";
            var text = encodeURIComponent("「出る烏賊は打たれる」でscore" + score + "点を獲得しました！");
            var tag = "squid_circuit";
            window.open("https://twitter.com/intent/tweet?text=" + text + "&hashtags=" + tag + "&url=" + url);
        }
        ika_draw();
    } else {
        ika_draw();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(gameover, 0, 0);
        if (space) {
            mode = mode_t.title;
            message.innerText = "ゲーム開始待機 score:" + score;
        }
    }
    
    space = false;
}

window.onload = () => {
    canvas = <HTMLCanvasElement>document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    angle = 0;

    random = make_xorshift(seed_generate());
    
    mode = mode_t.title;

    ika = new Image(160, 80);
    danger = new Image(160, 80);
    bg = new Image(640, 480);
    rare = new Image(160, 80);
    raredanger = new Image(160, 80);
    title = new Image(640, 480);
    gameover = new Image(640, 480);
    ika.src = "ika.png";
    bg.src = "bg.png";
    rare.src = "rareika.png";
    title.src = "title.png";
    gameover.src = "gameover.png";
    danger.src = "ikadanger.png";
    raredanger.src = "raredanger.png";

    ctx.fillStyle = "black";

    score = 0;
    message = document.getElementById("message");

    data = new Array(16);
    outer = new Array(16);
    data[0] = 2;
    outer[0] = 0;
    for (var i = 1; i < 16; ++i) {
        data[i] = 0;
        outer[i] = 0;
    }
    $(function () {
        $("html").keydown(function (e) {
            switch (e.which) {
                case 39:
                    right = true;
                    break;
                case 37:
                    left = true;
                    break;
                case 32:
                    space = true;
                    break;
            }
        });
    });
    $(function () {
        $("html").keyup(function (e) {
            switch (e.which) {
                case 39:
                    right = false;
                    break;
                case 37:
                    left = false;
                    break;
            }
        });
    });
    setInterval(loop, 20);
};