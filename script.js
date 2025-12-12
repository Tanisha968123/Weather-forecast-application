const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')
const weatherInfoSection = document.querySelector('.weather-info')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')

const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const humidityValueTxt = document.querySelector('.humidity-value-txt')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateTxt = document.querySelector('.current-date-txt')

const aqiValueTxt = document.querySelector('.aqi-value-txt')
const aqiMessageTxt = document.querySelector('.aqi-message-txt')

const forecastItemsContainer = document.querySelector('.forecast-items-container')

const apiKey = 'f3522fd78d32a3a74e578e3e3c2458de'

// ⭐ WAQI API TOKEN — REPLACE WITH YOURS
const waqiToken = "1249af9dc1fa483b4a270e467b1cbe000232591e";

// -------------------------------------------------------------------

searchBtn.addEventListener('click', () => {
    if(cityInput.value.trim() != ""){
        updateWeatherInfo(cityInput.value)
        cityInput.value = ""
        cityInput.blur()
    }
})

cityInput.addEventListener('keydown', (event) =>{
    if (event.key === 'Enter' && cityInput.value.trim() != "") {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ""
        cityInput.blur()
    }
})

async function getFetchData(endPoint, city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`
    const response = await fetch(apiUrl)
    return response.json()
}

function getweatherIcon(id){
    if(id <= 232) return 'thunderstorm.svg'
    if(id <= 321) return 'drizzle.svg'
    if(id <= 531) return 'rain.svg'
    if(id <= 622) return 'snow.svg'
    if(id <= 781) return 'atmosphere.svg'
    if(id <= 800) return 'clear.svg'
    return 'clouds.svg'
}

function getCurrentDate(){
    const currentDate = new Date()
    const options = { weekday: 'short', day: '2-digit', month: 'short' }
    return currentDate.toLocaleDateString('en-GB', options)
}

// -------------------------------------------------------------------

async function updateWeatherInfo(city){
    const weatherData = await getFetchData('weather', city)

    if(weatherData.cod != 200){
        showDisplaysection(notFoundSection)
        return
    }

    const {
        name: country,
        main:{ temp, humidity },
        weather: [{id, main}],
        wind: { speed }
    } = weatherData

    countryTxt.textContent = country
    tempTxt.textContent = Math.round(temp) + '°C'
    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity + '%'
    windValueTxt.textContent = speed + ' m/s'
    currentDateTxt.textContent = getCurrentDate()
    weatherSummaryImg.src = `assets/weather/${getweatherIcon(id)}`

    // ⭐ REAL AQI (WAQI API)
    await updateAqiInfo(city)

    // Forecast
    await updateforecastsInfo(city)

    showDisplaysection(weatherInfoSection)
}

// -------------------------------------------------------------------
// ⭐ WAQI AQI FETCH + DISPLAY
// -------------------------------------------------------------------

async function updateAqiInfo(city){
    try {
        const url = `https://api.waqi.info/feed/${city}/?token=${waqiToken}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.status !== "ok") {
            aqiValueTxt.textContent = "N/A"
            aqiMessageTxt.textContent = "Unavailable"
            return
        }

        const aqi = data.data.aqi

        aqiValueTxt.textContent = aqi
        aqiMessageTxt.textContent = getAqiMessage(aqi)

        // Apply AQI color class
        aqiValueTxt.className = `aqi-value-txt ${getAqiCategoryStyle(aqi)}`
        
    } catch (error) {
        aqiValueTxt.textContent = "N/A"
        aqiMessageTxt.textContent = "Error"
    }
}

function getAqiMessage(aqi){
    if (aqi <= 50) return "Good"
    if (aqi <= 100) return "Moderate"
    if (aqi <= 150) return "Unhealthy for Sensitive Groups"
    if (aqi <= 200) return "Unhealthy"
    if (aqi <= 300) return "Very Unhealthy"
    return "Hazardous"
}

function getAqiCategoryStyle(aqi){
    if (aqi <= 50) return 'aqi-good'
    if (aqi <= 100) return 'aqi-moderate'
    if (aqi <= 150) return 'aqi-usg'
    if (aqi <= 200) return 'aqi-unhealthy'
    if (aqi <= 300) return 'aqi-very-unhealthy'
    return 'aqi-hazardous'
}

// -------------------------------------------------------------------

async function updateforecastsInfo(city){
    const forecastsData = await getFetchData('forecast', city)

    forecastItemsContainer.innerHTML = ''
    const processedDates = new Set()
    const today = new Date().toISOString().split('T')[0]
    let daysCount = 0
    const maxDays = 5

    for (const forecastWeather of forecastsData.list) {
        const fullDate = forecastWeather.dt_txt.split(' ')[0]

        if (fullDate !== today) {
            if (!processedDates.has(fullDate)) {
                updateForecastItems(forecastWeather)
                processedDates.add(fullDate)
                daysCount++

                if (daysCount >= maxDays) break
            }
        }
    }
}

function updateForecastItems(WeatherData){
    const {
        dt_txt : date,
        weather: [{id}],
        main: { temp },
    } = WeatherData

    const dateTaken = new Date(date)
    const dateOption = { day: '2-digit', month: 'short' }
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getweatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
}

function showDisplaysection(section){
    [notFoundSection, weatherInfoSection, searchCitySection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex'
}



