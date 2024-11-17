function initMap() {
  // Configurações para o mapa
  let lat = -29.6977719713085
  let lng = -52.43759940638512

  const mapOptions = {
    center: { lat, lng }, // Coordenadas de Santa Cruz do Sul
    zoom: 15, // Zoom inicial
    disableDefaultUI: true, // Remove todos os controles padrão
  }

  // Inicializa o mapa no elemento #map
  const map = new google.maps.Map(document.getElementById("map"), mapOptions)

  const marker = new google.maps.Marker({
    position: { lat, lng }, // Define a posição do marcador  -52.4371118574985243797016434239
    map: map, // Adiciona o marcador ao mapa
    title: "Santa Cruz do Sul", // Texto que aparece ao passar o mouse
  })

  // Verifica se é dia ou noite e altera o ícone
  updateWeatherIcon()
}

function updateWeatherIcon() {
  const currentHour = new Date().getHours() // Obtém a hora atual (0-23)
  const tempImg = document.getElementById("temp_img") // Obtém o elemento da imagem

  // Define o ícone com base na hora
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

function formatDate() {
  const now = new Date()

  const options = {
    year: "numeric",
    month: "short", // Nome do mês completo (Ex: Novembro)
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  return now.toLocaleString("pt-BR", options) // Formato Brasil
}
function updateDateTime() {
  document.getElementById("data").innerText = formatDate()
  updateWeatherIcon()
}

function toggleMode() {
  const body = document.querySelector("body")
  body.classList.toggle("dark")
}

setInterval(updateDateTime, 10000)
updateDateTime()

// Chama o mapa ao carregar a página
window.onload = initMap
