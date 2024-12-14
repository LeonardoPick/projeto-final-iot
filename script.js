let tempMax = null
let tempMin = null
let raining = 0
let lat = -29.697573771794765
let lng = -52.43576033878338
let dataAtual = new Date()

function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

function compararTemperatura(temperatura) {
  verificarNovoDia()
  if (tempMax === null || temperatura > tempMax) {
    tempMax = temperatura
    document.getElementById("temp_max").textContent = temperatura.toFixed(2)
  }

  if (tempMin === null || temperatura < tempMin) {
    tempMin = temperatura
    document.getElementById("temp_min").textContent = temperatura.toFixed(2)
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
    tempImg.src = "http://openweathermap.org/img/wn/09d@2x.png" // Ícone de chuva
    tempImg.alt = "Chovendo"
  } else {
    if (
      currentHour >= /*times.sunrise*/ 6 &&
      currentHour < /*times.sunset*/ 18
    ) {
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

setInterval(updateDateTime, 10000) //loop de 10s para mudar o tempo e a bateria
updateDateTime() //chamar uma vez para adicionar a img

// Chama o mapa ao carregar a página
window.onload = initMap

// Função para atualizar os elementos HTML
function updateSensorData(data) {
  document.getElementById("temp_value").textContent = `${data.temp.toFixed(
    2
  )} °C`

  compararTemperatura(data.temp)

  document.getElementById("pressure").textContent = `${data.press.toFixed(
    2
  )} atm`

  let tensao = data.tensao.toFixed(2)
  porcentagem = map(tensao, 3.0, 5.0, 0, 100)
  document.getElementById("battery").textContent = porcentagem.toFixed(2)

  document.getElementById("lumi").textContent = `${data.lum.toFixed(2)} %`

  document.getElementById("raining").textContent = `${data.chuva.toFixed(2)} mm`
  document.getElementById("last-att").textContent = data.hora
  raining = data.chuva.toFixed(2)
  lat = data.lat || lat
  lng = data.lon || lng

  initMap()
}

const ws = new WebSocket(`ws://${window.location.hostname}/ws`)

// Evento para receber mensagens do servidor
ws.addEventListener("open", () =>
  console.log("Conexão WebSocket estabelecida!")
)
ws.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data.replace(/'/g, '"'))
    updateSensorData(data)
  } catch (error) {
    console.error("Erro ao processar dados do WebSocket:", error)
  }
})
ws.addEventListener("close", () => console.log("Conexão WebSocket encerrada."))
ws.addEventListener("error", (error) =>
  console.error("Erro no WebSocket:", error)
)
