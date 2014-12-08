var fileName = "saved_tests2.txt";

var fileExist = undefined;
var fsAction = undefined;
var fsTestString = undefined;
var fsCallback;



function loadSavedTests(callback) {
	fsCallback = callback;
	fsAction = "load";
	ifFileExist(initFS);
}

function saveTestResults(testString, callback) {
	fsCallback = callback;
	fsTestString = "st.push(" + testString + ");";
	fsAction = "save";
	ifFileExist(initFS);
}

function ifFileExist(callback) {

	if (fileExist == undefined) {

		var fail = genericFail("Failed to load file system");

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
				fileSystem) {

			fileSystem.root.getFile(fileName, {
				create : false
			}, function() {

				fileExist = true;
				callback();
			}, function() {

				fileExist = false;
				callback();
			});
		}, fail);
	} else {
		return callback();
	}
}

function initFS() {

	var fail = genericFail("Failed to load file system");
	window
			.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem,
					fail);
}

function gotFileSystem(fileSystem) {
	var fail = genericFail("error in reading " + fileName);
	fileSystem.root.getFile(fileName, {
		create : !fileExist,
		exclusive : true
	}, gotFileEntry, fail);

}

function gotFileEntry(fileEntry) {
	switch (fsAction) {
	case "load":
		var fail = genericFail("fail in read the file");
		fileEntry.file(readFile, fail);
		break;
	case "save":
		var fail = genericFail("fail in create writer");
		fileEntry.createWriter(saveTest, fail);
		break;
	}

}
function saveTest(writer) {

	writer.onwriteend = function() {
		fsCallback();
	};

	if (fileExist)
		writer.seek(writer.length);
	writer.write(fsTestString);

	fileExist = true;
}

function readFile(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		var fileStr = evt.target.result;
		// console.log(evt.target.result);
		var st = [];
		eval(fileStr);
		fsCallback(st);
	};
	reader.readAsText(file);
	fileExist = true;
};

function genericFail(msg) {
	return function(e) {
		debugMsg("[" + msg + "]" + e.errorCode);
	};
}

function debugMsg(m) {
	alert(m);
}
