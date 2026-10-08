export default {
	httpGet: function (url) {
		let tmpXhr = new XMLHttpRequest();
		try {
			tmpXhr.open("get", url, false);
			tmpXhr.send();
		} catch (e) {
			console.warn("httpGet failed for url:", url, e);
		}
		return tmpXhr;
	},
	httpPost: function (url, sendData) {
		let tmpXhr = new XMLHttpRequest();
		try {
			tmpXhr.open("post", url, false);
			tmpXhr.send(sendData);
		} catch (e) {
			console.warn("httpPost failed for url:", url, e);
		}
		return tmpXhr;
	},
	messageAlert: function (tmpData) {
		if ("status" in tmpData == true) {
			if (tmpData.status == -1) {
				if ("message" in tmpData == true) {
					alert("错误信息：\n" + tmpData.message);
				}
				return false;
			}
			return true;
		}
		return false;
	}
}