var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () {
            return _this.span.innerHTML = new Date().toUTCString();
        }, 500);
    };

    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
})();

var Vector2 = (function () {
    function Vector2(x, y) {
        this.X = x;
        this.Y = y;
    }
    Vector2.prototype.distanceTo = function (v2) {
        var a = this.X - v2.X;
        var b = this.Y - v2.Y;
        var c2 = Math.pow(a, 2) + Math.pow(b, 2);
        return Math.sqrt(c2);
    };
    return Vector2;
})();

var Captcha = (function () {
    function Captcha(c) {
        var _this = this;
        this.con = c.getContext('2d');
        this.canvas = c;
        this.canvas.addEventListener("mousedown", function (event) {
            return _this.onMouseDown(event);
        }, false);
        this.control_pts = [new Vector2(250, 50), new Vector2(50, 450), new Vector2(450, 450)];
    }
    Captcha.prototype.onMouseDown = function (e) {
        var x, y;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        // Convert to coordinates relative to the convas
        x -= this.con.canvas.offsetLeft;
        y -= this.con.canvas.offsetTop;

        var mp = new Vector2(x, y);
        var m = this.control_pts[0];
        var c = this.control_pts[1];
        var r = this.control_pts[2];
        var b = this.pointInTriangle(mp, m, c, r);
        this.draw();
        if (b == true) {
            this.con.fillText("m=" + Math.round(mp.distanceTo(m)) + " c=" + Math.round(mp.distanceTo(c)) + " r=" + Math.round(mp.distanceTo(r)), 50, 50, 80);

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
    };

    Captcha.prototype.draw = function () {
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
    };

    Captcha.prototype.getCursorPosition = function (e) {
        var x;
        var y;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        // Convert to coordinates relative to the convas
        x -= this.con.canvas.offsetLeft;
        y -= this.con.canvas.offsetTop;

        return [x, y];
    };

    Captcha.prototype.pointInTriangle = function (point, v1, v2, v3) {
        var A = (-v2.Y * v3.X + v1.Y * (-v2.X + v3.X) + v1.X * (v2.Y - v3.Y) + v2.X * v3.Y) / 2;
        var sign = A < 0 ? -1 : 1;
        var s = (v1.Y * v3.X - v1.X * v3.Y + (v3.Y - v1.Y) * point.X + (v1.X - v3.X) * point.Y) * sign;
        var t = (v1.X * v2.Y - v1.Y * v2.X + (v1.Y - v2.Y) * point.X + (v2.X - v1.X) * point.Y) * sign;
        return s > 0 && t > 0 && s + t < 2 * A * sign;
    };
    return Captcha;
})();

var captcha;

window.onload = function () {
    var c = document.getElementById('captcha');
    captcha = new Captcha(c);
    captcha.draw();
};
//# sourceMappingURL=app.js.map
