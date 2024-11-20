let tempMax = null
let tempMin = null
let dataAtual = new Date()

function compararTemperatura(temperatura) {
  if (tempMax === null || temperatura > tempMax) {
    tempMax = temperatura
    document.getElementById("temp_max").textContent = temperatura
  }

  if (tempMin === null || temperatura < tempMin) {
    tempMin = temperatura
    document.getElementById("temp_min").textContent = temperatura
  }
}

function verificarNovoDia() {
  const novaData = new Date()
  if (novaData.getDate() !== dataAtual.getDate()) {
    tempMax = null
    tempMin = null
    dataAtual = novaData
  }
}

function initMap() {
  const lat = -30.040267143389407
  const lng = -51.09482406662799

  const mapOptions = {
    //pega o local baseado na latitude e longitude
    center: { lat, lng },
    zoom: 15,
    disableDefaultUI: true,
  }

  const map = new google.maps.Map(document.getElementById("map"), mapOptions) //pega o mapa

  const geocoder = new google.maps.Geocoder() //usa outra API do google maps para pegar o nome

  // Função de geocodificação para obter o nome da cidade
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === "OK") {
      //se deu certo ele continua o processo
      if (results[0]) {
        const addressComponents = results[0].address_components //pega o endereço
        const city =
          addressComponents.find(
            (
              c //
            ) => c.types.includes("administrative_area_level_2") //pega a area admistrativa2, que seria o nome da cidade
          )?.long_name || "Cidade não encontrada"

        // Adiciona marcador no mapa
        const marker = new google.maps.Marker({
          //adiciona o marcador
          position: { lat, lng },
          map: map,
          title: `${city}`,
        })

        // Atualiza o HTML com o nome da cidade e país
        document.getElementById("title").textContent = `${city}` //muda no html o nome
      } else {
        console.error("Nenhum resultado encontrado para a geocodificação.") //mensagens de erro
        document.getElementById("title").textContent =
          "Nenhuma informação de cidade encontrada."
      }
    } else {
      console.error("Erro na geocodificação:", status) //mensagens de erro
      document.getElementById("title").textContent = "Erro ao buscar a cidade."
    }
  })
}

function updateWeatherIcon() {
  const currentHour = new Date().getHours() // Obtém a hora atual (0-23)
  const tempImg = document.getElementById("temp_img") // Obtém o elemento da imagem

  // Define o ícone com base na hora
  if (raining > 0) {
    tempImg.src = "http://openweathermap.org/img/wn/09d@2x.png" // Ícone de dia
    tempImg.alt = "Clima durante o dia"
  } else {
    if (currentHour >= 6 && currentHour < 18) {
      // Durante o dia
      tempImg.src = "http://openweathermap.org/img/wn/01d@2x.png" // Ícone de dia
      tempImg.alt = "Clima durante o dia"
    } else {
      // Durante a noite
      tempImg.src = "http://openweathermap.org/img/wn/01n@2x.png" // Ícone de noite
      tempImg.alt = "Clima durante a noite"
    }
  }
}

function updateBatteryIcon() {
  const batterySpan = document.getElementById("battery")
  const batteryIcon = document.getElementById("battery-icon")
  const batteryLevel = parseFloat(batterySpan.innerText)

  // Remove todas as classes relacionadas ao ícone da bateria
  batteryIcon.classList.remove(
    "fa-battery-empty",
    "fa-battery-quarter",
    "fa-battery-half",
    "fa-battery-three-quarters",
    "fa-battery-full"
  )

  // Define a nova classe com base no nível de bateria
  if (batteryLevel >= 75) {
    batteryIcon.classList.add("fa-battery-full")
  } else if (batteryLevel >= 50) {
    batteryIcon.classList.add("fa-battery-three-quarters")
  } else if (batteryLevel >= 25) {
    batteryIcon.classList.add("fa-battery-half")
  } else if (batteryLevel >= 5) {
    batteryIcon.classList.add("fa-battery-quarter")
  } else {
    batteryIcon.classList.add("fa-battery-empty")
  }
}

function formatDate() {
  const now = new Date()

  const options = {
    //pega a data do computador
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  return now.toLocaleString("pt-BR", options) // Formato Brasil proprio do formatDate
}
function updateDateTime() {
  document.getElementById("data").innerText = formatDate()
  updateWeatherIcon() //chama para atulizar o weather
  updateBatteryIcon() //chama para atulizar a battery
}

function toggleMode() {
  //toogle adiciona o dark theme se n possuir e tira se tiver
  const body = document.querySelector("body")
  body.classList.toggle("dark")
}

setInterval(updateDateTime, 10000)
updateDateTime()

// Chama o mapa ao carregar a página
window.onload = initMap

const socket = new WebSocket("ws://<IP_DO_RASPI>:8765")

// Função para atualizar os elementos HTML
function updateSensorData(data) {
  document.getElementById("temperature").textContent =
    data.temperature.toFixed(2)

  compararTemperatura(data.temperature)

  document.getElementById("pressure").textContent = data.pressure.toFixed(2)
  document.getElementById("altitude").textContent = data.altitude.toFixed(2)
  document.getElementById("battery").textContent = data.battery.toFixed(2)
  document.getElementById("lumi").textContent = data.lumi.toFixed(2)
  document.getElementById("raining").textContent = data.raining.toFixed(2)

  let raining = data.raining.toFixed(2)

  document.getElementById("latitude").textContent = data.latitude || "N/D"
  document.getElementById("longitude").textContent = data.longitude || "N/D"
  initMap(data.latitude, data.longitude)
}

// Evento quando a conexão é aberta
socket.addEventListener("open", () => {
  console.log("Conectado ao WebSocket!")
})

// Evento para receber mensagens do servidor
socket.addEventListener("message", (event) => {
  try {
    const sensorData = JSON.parse(event.data.replace(/'/g, '"')) // Substitui aspas simples por duplas
    updateSensorData(sensorData)
  } catch (error) {
    console.error("Erro ao processar os dados recebidos:", error)
  }
})

// Evento de erro
socket.addEventListener("error", (error) => {
  console.error("Erro no WebSocket:", error)
})

// Evento quando a conexão é encerrada
socket.addEventListener("close", () => {
  console.log("Conexão com WebSocket encerrada.")
})
