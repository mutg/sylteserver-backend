var colors = ['#D6af93', '#e5c79e', '#85Ce84', '#4f5b53' , '#113847']

module.exports = {
    getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)]
    } 
}