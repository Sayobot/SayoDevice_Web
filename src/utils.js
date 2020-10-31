export default {
	httpGet: function (url) {
		let tmpXhr = new XMLHttpRequest();
		tmpXhr.open("get", url, false);
		tmpXhr.send();
		return tmpXhr;
	},
	httpPost: function (url, sendData) {
		let tmpXhr = new XMLHttpRequest();
		tmpXhr.open("post", url, false);
		tmpXhr.send(sendData);
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