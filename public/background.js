chrome.commands.onCommand.addListener((command) => {
	console.log(`Command: ${command}`)
	if (command == 'open-as-tab') {
		chrome.tabs.create({
			url: 'index.html'
		})
	}
	return
})
