const st = document.getElementById("script");
const est = document.createElement("pre");
const esc = document.createElement("code");
esc.classList.add("language-js")
esc.innerHTML = st.innerHTML;
est.appendChild(esc);
document.body.appendChild(est);

hljs.highlightAll();
