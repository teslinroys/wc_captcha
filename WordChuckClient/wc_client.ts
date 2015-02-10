class Vector2 {
    public X: number;
    public Y: number;

     /**
 * Represents a 2D vector.
 * @constructor
 */
    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    /** Returns the distance between this vector and the input vector. */
    distanceTo(v2: Vector2): number {
        var a = this.X - v2.X;
        var b = this.Y - v2.Y;
        var c2 = Math.pow(a, 2) + Math.pow(b, 2);
        return Math.sqrt(c2);
    }
}

class Captcha {
    public con: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;
    public control_pts:Vector2[];

 /**
 * Constructs the interactive CAPTCHA element. 
 * @constructor
 */
    constructor(c: HTMLCanvasElement) {
        this.con = c.getContext('2d');
        this.canvas = c;
        this.canvas.addEventListener("mousedown", (event: MouseEvent) => this.onMouseDown(event), false);
        this.control_pts = [new Vector2(250, 50), new Vector2(50, 450), new Vector2(450, 450)];
    }

    /** This event handler redraws the canvas when it is clicked. */
    onMouseDown(e: MouseEvent) {
        var x, y;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }
        // Convert to coordinates relative to the convas
        x -= this.con.canvas.offsetLeft;
        y -= this.con.canvas.offsetTop;


        var mp: Vector2 = new Vector2(x, y);
        var m: Vector2 = this.control_pts[0];
        var c: Vector2 = this.control_pts[1];
        var r: Vector2 = this.control_pts[2];
        var b: boolean = this.pointInTriangle(mp, m, c, r);
        this.draw();
        if (b == true) {
            this.con.fillText("m=" + Math.round(mp.distanceTo(m)) +" c=" + Math.round(mp.distanceTo(c)) + " r=" + Math.round(mp.distanceTo(r)), 50, 50, 80);

            this.con.beginPath();
            this.con.moveTo(m.X, m.Y);
            this.con.lineTo(mp.X, mp.Y);

            this.con.moveTo(c.X, c.Y);
            this.con.lineTo(mp.X, mp.Y);

            this.con.moveTo(r.X, r.Y);
            this.con.lineTo(mp.X, mp.Y);
            this.con.closePath();

            this.con.strokeStyle = 'rgb(32, 128, 64)';
            this.con.stroke();

        }
    }

    /** Draws the CAPTCHA element to the specified canvas. */
    draw() {
        this.con.clearRect(0, 0, this.con.canvas.width, this.con.canvas.height);
        this.con.beginPath();
        this.con.moveTo(this.control_pts[0].X, this.control_pts[0].Y);
        for (var i = 0; i < this.control_pts.length; i++) {
            this.con.lineTo(this.control_pts[i].X, this.control_pts[i].Y);
        }
        this.con.lineTo(this.control_pts[0].X, this.control_pts[0].Y);
        this.con.closePath();
        this.con.strokeStyle = 'black';
        this.con.stroke();
    }

    /** Returns the cursor position relative to the canvas. */
    getCursorPosition(e) {
    var x;
    var y;
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }
    // Convert to coordinates relative to the convas
    x -= this.con.canvas.offsetLeft;
    y -= this.con.canvas.offsetTop;

    return [x, y]
}

    /** Returns whether or not a given point (e.g. mouse position) is inside a triangular area. */
    pointInTriangle (point:Vector2, v1:Vector2, v2:Vector2, v3:Vector2) : boolean {
        var A = (-v2.Y * v3.X + v1.Y * (-v2.X + v3.X) + v1.X * (v2.Y - v3.Y) + v2.X * v3.Y) / 2;
        var sign = A < 0 ? -1 : 1;
        var s = (v1.Y * v3.X - v1.X * v3.Y + (v3.Y - v1.Y) * point.X + (v1.X - v3.X) * point.Y) * sign;
        var t = (v1.X * v2.Y - v1.Y * v2.X + (v1.Y - v2.Y) * point.X + (v2.X - v1.X) * point.Y) * sign;
        return s > 0 && t > 0 && s + t < 2 * A * sign;
    }
}

var captcha;

/** Loads CAPTCHA element. */
window.onload = () => {
    var c = <HTMLCanvasElement> document.getElementById('captcha');
    captcha = new Captcha(c);
    captcha.draw();
};