module.exports = EnviroObject;
module.exports = LampObject;

function EnviroObject() {

    if (this.constructor === EnviroObject) {
        throw new TypeError('Abstract class "EnviroObject" cannot be instantiated directly.'); 
    }
};

EnviroObject.prototype.getName = function() {
    throw new TypeError('Cannot call abstract method');
}

EnviroObject.prototype.getState = function() {
    throw new TypeError('Cannot call abstract method');
}

EnviroObject.prototype.updateServer = function () {
    throw new TypeError('Cannot call abstract method');
}

EnviroObject.prototype.updateClient = function () {
    throw new TypeError('Cannot call abstract method');
}

function LampObject(name, lampOn) {

    EnviroObject.apply(this, arguments);

    this.name = name;
    this.lampOn = lampOn;
};

LampObject.prototype = Object.create(EnviroObject.prototype);

LampObject.prototype.constructor = LampObject;

LampObject.prototype.getName = function() {

    return this.name;
}

LampObject.prototype.getState = function() {

    return this.lampOn;
}

LampObject.prototype.updateServer = function() {

    this.lampOn = !this.lampOn;

    return this.lampOn;
}

LampObject.prototype.updateClient = function() {

    var lightBulb = document.getElementById(this.name);

    var mat = lightBulb.getElementsByTagName("Material");

    var status = mat[0].getAttribute("diffuseColor");

    if (status == ".95, .9, .25") {
        mat[0].setAttribute("diffuseColor", ".64 .69 .72");
    } else {
        mat[0].setAttribute("diffuseColor", ".95, .9, .25");
    } 
}