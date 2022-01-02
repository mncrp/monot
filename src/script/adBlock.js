var element = document;
document.addEventListener('DOMContentLoaded', function () {
    adBlock();
});

window.onload = () => {
    adBlock();
    setTimeout(adBlock, 3000);
    setTimeout(adBlock, 5000);
}

const adBlock = () => {
    if (!location.hostname == "youtube.com") {
        dt("iframe");
    }
    dc("yjAdImage");
    dc("yadsOverlay");
    da(/ad/gi);
    dt("ins")
}

const dt = (elementTag) => { //Delete tag
    Array.prototype.slice.call(element.getElementsByTagName(elementTag)).forEach((el) => {
        el.remove();
    });
}

const dc = (elementClass) => { //Delete class
    Array.prototype.slice.call(element.getElementsByClassName(elementClass)).forEach((el) => {
        el.remove();
    });
}

const di = (elementId) => { //Delete Id
    Array.prototype.slice.call(element.getElementById(elementId)).forEach((el) => {
        el.remove();
    });
}

const dn = (elementName) => { //Delete name
    Array.prototype.slice.call(element.getElementsByName(elementName)).forEach((el) => {
        el.remove();
    });
}

const da = (elementAll) => {
    dt(elementAll);
    dc(elementAll);
    di(elementAll);
    dn(elementAll);
}