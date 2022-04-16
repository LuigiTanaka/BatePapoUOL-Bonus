let nomeUsuario;
let start = 0;
let start2 = 0;
let ultimaMsg = document.querySelector(".mensagens");
let nomeUsuarioSelecionado;
let tipoVisibilidade;

function entrarSala() {
  nomeUsuario = prompt("Qual seu nome?");
  let objNome = { name: nomeUsuario };
  let promise = axios.post(
    "https://mock-api.driven.com.br/api/v6/uol/participants",
    objNome
  );
  promise.then(obterMensagens);
  promise.catch(erroEntrada);
}

function erroEntrada(erro) {
  if (erro.response.status === 400) {
    alert("Já existe um usuário online com esse nome!");
    entrarSala();
  } else {
    alert("Desculpe, tivemos um erro inesperado. Por favor tente novamente!");
    entrarSala();
  }
}

function obterMensagens() {
  let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
  promise.then(carregarMensagens);
}

function carregarMensagens(response) {
  let mensagens = response.data;
  let containerMensagens = document.querySelector(".mensagens");
  containerMensagens.innerHTML = "";

  for (let i = 0; i < mensagens.length; i++) {
    if (mensagens[i].type === "status") {
      containerMensagens.innerHTML += `
            <div class="msg-status">
                <span class="hora">(${mensagens[i].time})</span>
                <span class="nome">${mensagens[i].from}</span>
                <span>${mensagens[i].text}</span>
            </div>`;
    } else if (mensagens[i].type === "message") {
      containerMensagens.innerHTML += `
            <div class="msg-normal">
                <span class="hora">(${mensagens[i].time})</span>
                <span class="nome">${mensagens[i].from}</span>
                <span>para</span>
                <span class="nome">${mensagens[i].to}: </span>
                <span>${mensagens[i].text}</span>
            </div>`;
    } else if (mensagens[i].type === "private_message") {
      if (mensagens[i].to === nomeUsuario || mensagens[i].from === nomeUsuario) {
        containerMensagens.innerHTML += `
            <div class="msg-reservada">
                <span class="hora">(${mensagens[i].time})</span>
                <span class="nome">${mensagens[i].from}</span>
                <span>reservadamente para</span>
                <span class="nome">${mensagens[i].to}: </span>
                <span>${mensagens[i].text}</span>
            </div>`;
      }  
    }
  }

  let newUltimaMsg = document.querySelector(".mensagens").lastElementChild;

  if (newUltimaMsg.innerHTML !== ultimaMsg.innerHTML) {
    newUltimaMsg.scrollIntoView();
    ultimaMsg = newUltimaMsg;
  }

  if (start === 0) {
    setInterval(manterConexao, 4500);
    setInterval(obterMensagens, 3000);
    start++;
  }
}

function manterConexao() {
  let objNome = { name: nomeUsuario };
  axios.post("https://mock-api.driven.com.br/api/v6/uol/status", objNome);
}

function enviarMensagem() {
  let textoMensagem = document.querySelector("input").value;
  let mensagem;
  if (tipoVisibilidade === "Reservadamente") {
      mensagem = {
        from: nomeUsuario,
        to: nomeUsuarioSelecionado,
        text: textoMensagem,
        type: "private_message" // ou "private_message" para o bônus
      };
  } else {
    mensagem = {
      from: nomeUsuario,
      to: "Todos",
      text: textoMensagem,
      type: "message" // ou "private_message" para o bônus
    };
  }

  let promise = axios.post(
    "https://mock-api.driven.com.br/api/v6/uol/messages",
    mensagem
  );
  promise.then(sucessoEnvio);
  promise.catch(erroEnvio);
}

function sucessoEnvio() {
  obterMensagens();
  document.querySelector("input").value = "";
}

function erroEnvio(erro) {
    if (erro.response.status !== 400) {
       window.location.reload();
    } 
}

entrarSala();

//----------------------------------------parte bonus---------------------------------------------

function mostrarSidebar() {
    document.querySelector(".sidebar").classList.remove("escondido")
    document.querySelector(".fundo-escuro").classList.remove("escondido");

    obterUsuarios();
}

function obterUsuarios() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(carregarUsuarios);
}

function carregarUsuarios(response) {
    let usuariosOnline = response.data;
    let containerUsuarios = document.querySelector(".usuarios");

    const usuarioComCheck = containerUsuarios.querySelector(".check");
    let nomeUsuarioComCheck;
    if (usuarioComCheck !== null) {
        nomeUsuarioComCheck = usuarioComCheck.parentNode.querySelector("span").innerHTML;
    }

    containerUsuarios.innerHTML = "";
    for (let i = 0; i < usuariosOnline.length; i++) {
        if (usuariosOnline[i].name === nomeUsuarioComCheck) {
            containerUsuarios.innerHTML += `
            <div onclick="selecionarUsuario(this)" class="usuario">
                <div class="icone-nome">
                    <ion-icon name="person-circle-outline"></ion-icon>
                    <span>${usuariosOnline[i].name}</span>
                </div>
                <div class="user check">
                    <ion-icon name="checkmark"></ion-icon>
                </div>
            </div>`
        } else {
            containerUsuarios.innerHTML += `
            <div onclick="selecionarUsuario(this)" class="usuario">
                <div class="icone-nome">
                    <ion-icon name="person-circle-outline"></ion-icon>
                    <span>${usuariosOnline[i].name}</span>
                </div>
                <div class="user escondido">
                    <ion-icon name="checkmark"></ion-icon>
                </div>
            </div>`
        }

    }

    if (start2 === 0) {
        setInterval(obterUsuarios, 10000);
        start2++;
    }
}

function selecionarUsuario(usuarioSelecionado) {
    let jaSelecionado = document.querySelector(".usuarios").querySelector(".check")
    nomeUsuarioSelecionado = usuarioSelecionado.querySelector("span").innerHTML;
    if (jaSelecionado !== null) {
        jaSelecionado.classList.add("escondido");
        jaSelecionado.classList.remove("check");
    } else if (!usuarioSelecionado.classList.contains("todos")) {
        let checkTodos = document.querySelector(".todos").querySelector(".check");
        if (checkTodos !== null) {
            checkTodos.classList.add("escondido");
            checkTodos.classList.remove("check");
        }
    }

    let check = usuarioSelecionado.querySelector(".user");
    check.classList.add("check");
    check.classList.remove("escondido");

    if (nomeUsuarioSelecionado === "Todos") {
      let publico = document.querySelector(".publico");
      if (publico.querySelector(".visib").classList.contains("escondido")) {
        selecionarVisibilidade(publico);
      }
    }

    editarAreaDeEscrita();
}

function selecionarVisibilidade(visibilidadeSelecionada) {
    let jaSelecionada = document.querySelector(".visibilidades").querySelector(".check")
    tipoVisibilidade = visibilidadeSelecionada.querySelector("span").innerHTML;
    if (jaSelecionada !== null) {
        jaSelecionada.classList.add("escondido");
        jaSelecionada.classList.remove("check");
    }

    let check = visibilidadeSelecionada.querySelector(".visib");
    check.classList.add("check");
    check.classList.remove("escondido");

    if (tipoVisibilidade === "Público") {
        let todos = document.querySelector(".todos");
        if (todos.querySelector(".user").classList.contains("escondido")) {
          selecionarUsuario(todos);
        }
    }

    editarAreaDeEscrita();

}

function editarAreaDeEscrita() {
  let areaDeEscrita = document.querySelector(".area-de-escrita");
    areaDeEscrita.innerHTML = "";
    if (tipoVisibilidade === "Reservadamente" && nomeUsuarioSelecionado !== "Todos") {
        areaDeEscrita.innerHTML += `
        <input type="text" placeholder="Escreva aqui..." />
        <h2>Enviando para ${nomeUsuarioSelecionado} (reservadamente)</h2>`;
    } else {
        areaDeEscrita.innerHTML += `
        <input type="text" placeholder="Escreva aqui..." />`
    }
}

function esconderSidebar() {
    document.querySelector(".sidebar").classList.add("escondido");
    document.querySelector(".fundo-escuro").classList.add("escondido");
}