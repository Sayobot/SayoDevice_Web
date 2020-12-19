<template>
  <div class="row" id="connect">
    <!-- 搜索、连接、断开 及设备列表 -->
    <div class="col-3 d-flex flex-column" style="height: 400px;">
      <h2 v-if="message !== ''" style="position: fixed;bottom:0px;right:0px;z-index:3">
        {{lang.RTmsg_}}：{{ lang[message] }} 
      </h2>
      <br />
      <br />
      <div class="btn-group">
        <button
          class="btn btn-secondary"
          v-if="connectedDeviceIndex == null"
          v-on:click="searchDevices"
        >
          {{ lang.searchDevices_ }}
        </button>
        <button
          class="btn btn-success"
          v-if="selectedDeviceIndex != null && connectedDeviceIndex == null"
          v-on:click="connectDevice"
        >
          {{ lang.connect_ }}
        </button>
        <button
          class="btn btn-danger"
          v-if="connectedDeviceIndex != null"
          v-on:click="disconnectDevice"
        >
          {{ lang.disconnect_ }}
        </button>
      </div>
      <ul class="list-group" v-if="connectedDeviceIndex == null">
        <li
          class="list-group-item"
          v-for="(device, deviceIndex) in devices.data"
          v-bind:key="deviceIndex"
          v-on:click="selectDevice(deviceIndex)"
          v-bind:class="{ active: selectedDeviceIndex == deviceIndex }"
        >
          {{ device.product_string }}
        </li>
      </ul>
      <br />
      <button
        type="button"
        class="btn btn-info"
        v-if="connectedDeviceIndex != null && device.mode == 'app'"
        v-bind:class="{ disabled: unsaved == 0 }"
        v-on:click="save"
      >
        {{ lang.permanentSave_ }}
        <br />
        ({{ unsaved == 0 ? "√" : lang.unsaved_ + unsaved }})
      </button>
      <ul
        v-if="connectedDeviceIndex == null"
        class="list-group"
        style="position:fixed;bottom:5%;"
      >
        <!--
				<select v-if="connLang.data.length > 1" class="col " v-model="selectedLangIndex" v-on:change="chooseLanguage()">
					<option v-for="(language, languageIndex) in connLang.data" v-bind:key="languageIndex" v-bind:value="languageIndex">
						<img :src="language.flag" height="25" />
						&nbsp;{{language.name}}
					</option>
				</select>
				-->
        <li
          class="bgbtn list-group-item"
          v-for="(language, languageIndex) in connLang.data"
          v-bind:key="languageIndex"
          v-on:click="chooseLanguage(languageIndex)"
          v-bind:class="{ active: selectedLangIndex == languageIndex }"
        >
          <img :src="language.flag" height="25" />
          &nbsp;{{ language.name }}
        </li>
      </ul>
      <div class="m-10">
        <b-form-checkbox
          v-if="connectedDeviceIndex == null"
          v-model="isSearchAllDevices"
          >{{ lang.searchAllDevices_ }}</b-form-checkbox
        >
      </div>
    </div>
    <div v-if="connectedDeviceIndex === null && sayoDevice === 0 && this.ad !== null" class="col-9">
      <br />
      <h1 style="text-align: center;">外设推荐</h1>
      <a class="col-1"></a>
      <a class="col-1"></a>
      <a class="col-1"></a>
      <button
        class="col-9 btn btn-outline-info"
        v-on:click="uriOpen('https://item.taobao.com/item.htm?id=580776520532')"
      >
        <img
          src="https://a.sayobot.cn/img/device/o2c/o2cv2.jpg"
          class="img-thumbnail"
        />
        <a>点击购买O2C v2</a>
      </button>
      <br>
      <br>
        <h4 style="text-align: center;">如果想禁用广告，请删除文件 html\ad </h4>
    </div>
    <div id="operation" class="col-9" v-if="connectedDeviceIndex != null">
      <br />
      <br />
      <div class="row">
        <button
          class="col btn btn-outline-info"
          v-for="(item, itemIndex) in root.data"
          v-bind:key="itemIndex"
          v-bind:class="{ active: itemIndex == selectedCmdIndex }"
          v-on:click="readCmdConfig(itemIndex)"
        >
          {{ item.title }}
        </button>
      </div>
      <div v-if="readOK !== 0">
        <b>{{ rttmsg }}</b>
        <b-toast
          id="my-toast"
          variant="success"
          solid
          auto-hide-delay="2000"
          no-close-button
          >{{ lang.corrected_ }}</b-toast
        >
        <b-modal
          id="chiose-setting-window"
          ref="chiose-setting-window"
          scrollable
          size="xl"
          :title="lang.select_"
          header-bg-variant="secondary"
          header-text-variant="light"
        >
          <div
            v-if="
              'values' in root.data[selectedCmdIndex].mode[active.mode] &&
                root.data[selectedCmdIndex].mode[active.mode].values.length > 0
            "
          >
            <h5 v-if="active.json.multiple_choice == true">
              <div
                style="margin: 0 4px;"
                v-show="true"
                v-for="(key, keyIndex) in presetData[
                  root.data[selectedCmdIndex].mode[active.mode].values[
                    active.value
                  ]
                ].data"
                v-bind:key="keyIndex"
                class="badge badge-pill badge-secondary"
                v-bind:class="{
                  'badge-success': active.keys[keyIndex] == true,
                }"
                v-on:click="selectActiveKey(keyIndex)"
              >
                {{ key.name }}
              </div>
            </h5>

            <h5 v-if="active.json.multiple_choice == false">
              <div
                style="margin: 0 4px;"
                v-for="(key, keyIndex) in presetData[
                  root.data[selectedCmdIndex].mode[active.mode].values[
                    active.value
                  ]
                ].data"
                v-bind:key="keyIndex"
                class="badge badge-pill badge-secondary"
                v-bind:class="{ 'badge-success': active.keys[0] == keyIndex }"
                v-on:click="selectActiveKey(keyIndex)"
              >
                {{ key.name }}
              </div>
            </h5>
          </div>
          <template v-slot:modal-footer>
            <b-button
              variant="secondary"
              size="sm"
              v-on:click="$bvModal.hide('chiose-setting-window')"
              >{{ lang.cancel_ }}</b-button
            >
            <b-button variant="primary" size="sm" v-on:click="setActiveKey">{{
              lang.ok_
            }}</b-button>
          </template>
        </b-modal>
        
        <div
          v-for="(num, numIndex) in myData[selectedCmdIndex].data"
          v-bind:key="numIndex"
        >
          <br />
          <a>{{ root.data[selectedCmdIndex].title }}&nbsp;{{
                  numIndex + 1
                }}</a>
          <div class="row row-cols-auto">
            <div
              v-if="root.data[selectedCmdIndex].mode.length > 1"
              class="col-3 list-group-item list-group-item-secondary text-truncate"
            >
              <b
                >{{ lang.mode_ }}</b
              >
            </div>
            <div
              class="col list-group-item list-group-item-secondary text-truncate"
              v-show="presetData[value].title != '空'"
              v-for="(value, valueIndex) in root.data[selectedCmdIndex].mode[
                myData[selectedCmdIndex].data[numIndex].selectedModeIndex
              ].values"
              v-bind:key="valueIndex"
            >
              <b>{{ presetData[value].title }}</b>
            </div>
          </div>
          <div class="row row-cols-auto">
            <select
              v-if="root.data[selectedCmdIndex].mode.length > 1"
              class="col-3 text-truncate"
              v-model="
                myData[selectedCmdIndex].data[numIndex].selectedModeIndex
              "
              v-on:change="modeWrite(numIndex)"
            >
              <option
                v-for="(mode, modeIndex) in root.data[selectedCmdIndex].mode"
                v-bind:key="modeIndex"
                v-bind:value="modeIndex"
                >{{ mode.name }}</option
              >
            </select>
            <div
              class="col btn btn-sm btn-outline-secondary text-left text-truncate"
              v-show="presetData[value].title != '空'"
              v-for="(value, valueIndex) in root.data[selectedCmdIndex].mode[
                num.selectedModeIndex
              ].values"
              v-bind:key="valueIndex"
            >
              <div
                v-if="presetData[value].input_type == 'choice'"
                v-b-modal.chiose-setting-window
                v-on:click="setPos(numIndex, value, valueIndex, num)"
                v-b-tooltip.html.hover.bottom="
                  getValueNameList(value, valueIndex, num)
                "
              >
                {{ getValueName(value, valueIndex, num) }}
              </div>


              <input
                v-if="
                  presetData[value].input_type == 'input' &&
                    presetData[value].subtype == 'int'
                "
                type="number"
                style="width:100%;"
                v-bind:min="presetData[value].min"
                v-bind:max="presetData[value].max"
                v-model.number="
                  myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[valueIndex]
                "
                v-on:change="inputCheck(numIndex, value, valueIndex, num)"
              />
              <input
                v-if="
                  presetData[value].input_type == 'input' &&
                    presetData[value].subtype == 'string'
                "
                type="string"
                style="width:100%;"
                v-model.trim="
                  myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[valueIndex]
                "
                v-on:change="inputCheck(numIndex, value, valueIndex, num)"
              />

              <input
                v-if="
                  presetData[value].input_type == 'input' &&
                    presetData[value].subtype == 'text_2'
                "
                type="text"
                maxlength="2"
                style="width:100%;"
                :id="'text'+numIndex"
                :value="GetText4Arr(numIndex, value, valueIndex, num)"
                v-on:change="SetText2Arr(numIndex, value, valueIndex, num)"
              />

              <input
                v-if="
                  presetData[value].input_type == 'input' &&
                    presetData[value].subtype == 'text'
                "
                type="text"
                :maxlength='presetData[value].max'
                style="width:100%;"
                :id="'text'+numIndex"
                :value="GetText4Arr_b(numIndex, value, valueIndex, num)"
                v-on:change="SetText2Arr_b(numIndex, value, valueIndex, num)"
              />

              <input
                v-if="presetData[value].input_type == 'color2arr' && (
                  presetData[value].lock === false ||
                  myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[0] === 0)"
                type="color"
                :id="'myColor'+numIndex"
                style="width:100%;"
                :value="GetColor4Arr(numIndex, value, valueIndex, num)"
                v-on:change="SetColor2Arr(numIndex, value, valueIndex, num)"
              />

              <input
                v-if="presetData[value].input_type == 'color'"
                type="color"
                :id="'myColor'+numIndex"
                style="width:100%;"
                :value="myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[valueIndex]"
                v-on:change="SetColor(numIndex, value, valueIndex, num)"
              />
              
              
              <!--
              <colorPicker
              v-if="presetData[value].input_type == 'color'"
              v-model="myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[valueIndex]" v-on:change="inputCheck(numIndex, value, valueIndex, num)"></colorPicker>
              <input
                v-if="presetData[value].input_type == 'color'"
                type="string"
                style="width:100%;"
                v-model.trim="
                  myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[valueIndex]
                "
                v-on:change="inputCheck(numIndex, value, valueIndex, num)"
              />
              -->
              <b
                v-if="
                  presetData[value].input_type == 'show' &&
                    presetData[value].subtype == 'string'
                "
                >{{
                  myData[selectedCmdIndex].data[numIndex].mode[
                    num.selectedModeIndex
                  ].values[valueIndex]
                }}</b
              >
            </div>
          </div>
          <div
            v-for="(button, buttonIndex) in root.data[selectedCmdIndex].mode[
              num.selectedModeIndex
            ].buttons"
            v-bind:key="buttonIndex"
          >
            <button
              v-if="
                presetData[button].input_type == 'button' &&
                  presetData[button].subtype == 'sendData'
              "
              type="button"
              class="btn btn-info"
              v-on:click="sendData(numIndex, button, buttonIndex)"
            >
              {{ presetData[button].title }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import Operation from "./Operation.vue";

export default {
  name: "Connect",
  // components: { Operation },
  data: function() {
    return {
      session: null,
      devices: {}, //所有设备的信息，注意区分
      sayoDevice: 0,
      rttmsg: "",
      message: "",
      selectedDeviceIndex: null,
      connectedDeviceIndex: null,
      isSearchAllDevices: false,
      connLang: {}, //多语言主文件
      lang: {}, //当前选中的语言的data
      selectedLangIndex: 0,
      device: null, //当前连接的设备的信息，注意区分
      root: {}, //根文件，
      selectedCmdIndex: null, //选中的选项
      presetData: [], //预加载data
      myData: [], //当前键盘配置文件缓存
      readOK: 0, //读取键盘配置成功的标志
      unsaved: 0, //当前修改但未点永久保存的
      ad: null,
      active: {
        json: {}, //当前操作选项的 input format文件
        keys: [], //当前操作的项目的 active key，用来显示选中状态
        opt: 0, //当前操作的选项卡，如 按键 或 灯光 的编号
        data: 0, //当前操作的编号
        mode: 0, //当前操作的模式编号
        value: 0, //当前操作的数值编号
        color: "",
        text:""
      },
    };
  },
  created: function() {
    this.connLang = JSON.parse(
      this.$utils.httpGet("http://127.0.0.1:7296/lang/lang.json").responseText
    );
    var tmpLangIndex = localStorage.getItem("langIndex");
    if (tmpLangIndex != null && this.connLang.data[tmpLangIndex] != null) {
      this.selectedLangIndex = tmpLangIndex;
    } else {
      this.selectedLangIndex = 0;
      localStorage.setItem("langIndex", this.selectedLangIndex);
    }
    try{
      this.ad = JSON.parse(this.$utils.httpGet("http://127.0.0.1:7296/ad").responseText);
    }
    catch{
      this.ad = null;
    }
    this.lang = this.connLang.data[this.selectedLangIndex].data;
    this.searchDevices();
  },
  methods: {
    searchDevices: function() {
      var tmpVendor_id = null;
      var tmpProduct_id = null;
      if (this.isSearchAllDevices == true) {
        tmpVendor_id = 0;
        tmpProduct_id = 0;
      } else {
        tmpVendor_id = 32905;
        tmpProduct_id = 0;
      }
      let tmpData = JSON.parse(
        this.$utils.httpPost(
          "http://127.0.0.1:7296/dev/API/DEVICES/",
          JSON.stringify({
            cmd: "search",
            vendor_id: tmpVendor_id,
            product_id: tmpProduct_id,
          })
        ).responseText
      );
      if ("message" in tmpData) {
        this.message = tmpData.message;
      } else {
        this.message = "";
      }
      this.sayoDevice = 0;
      this.devices = tmpData;
      if (tmpData.devices != 0) {
        this.selectedDeviceIndex = 0;
        tmpData.data.map((device) => {
          if (device.vendor_id === 32905) {
            this.sayoDevice = 1;
          }
        });
      } else {
        this.selectedDeviceIndex = null;
      }
    },
    selectDevice: function(deviceIndex) {
      this.selectedDeviceIndex = deviceIndex;
    },
    connectDevice: function() {
      this.device = this.devices.data[this.selectedDeviceIndex];
      console.log(this.device);
      this.connectedDeviceIndex = this.selectedDeviceIndex;
      let tmpData = JSON.parse(
        this.$utils.httpPost(
          "http://127.0.0.1:7296/dev/API/DEVICES/",
          JSON.stringify({
            cmd: "connect",
            path: this.device.path,
          })
        ).responseText
      );
      this.session = tmpData.session;
      if (this.device.mode == "app") {
        try {
          if (this.device.product_id == 3 && this.device.vendor_id == 0x8089)
          {
            this.root = JSON.parse(
              this.$utils.httpGet(
                "http://127.0.0.1:7296/emmm/main_vid_" +
                  this.device.model_code +
                  ".json"
              ).responseText
            );
          }
          else
          {
            this.root = JSON.parse(
              this.$utils.httpGet(
                "http://127.0.0.1:7296/emmm/main.json"
              ).responseText
            );
          }
        } catch {
          console.log("加载main format");
          if (this.device.model_code < 0x8000 && this.device.vendor_id == 0x8089 && this.device.product_id == 3)
          {
            this.root = JSON.parse(
              this.$utils.httpGet("http://127.0.0.1:7296/emmm/main_vid_3.json")
                .responseText
            );
          }
          else
          {
            this.root = JSON.parse(
              this.$utils.httpGet("http://127.0.0.1:7296/emmm/main.json")
                .responseText
            );
          }
        }
        if ("support_list" in this.device)
        {
          this.root.data.map((cmd,cmdIndex)=>{
            if ("cmd_code" in cmd)
            {
              if (this.device.support_list.findIndex((code)=>code === cmd.cmd_code) == -1)
              {
                this.root.data[cmdIndex].enable = false;
              }
            }
          });
          
          for (var i=0;i<this.root.data.length;)
          {
            if (('enable' in this.root.data[i])&& this.root.data[i].enable === false)
            {
              this.root.data.splice(i,1);
            }
            else
            {
              i++;
            }
          }
        }
      } else {
        try {
          this.root = JSON.parse(
            this.$utils.httpGet(
              "http://127.0.0.1:7296/emmm/bootloader_vid_" +
                this.device.model_code +
                ".json"
            ).responseText
          );
        } catch {
          console.log("加载main format");
          this.root = JSON.parse(
            this.$utils.httpGet("http://127.0.0.1:7296/emmm/bootloader.json")
              .responseText
          );
        }
      }
      //预加载文件
      this.root.data.map((opt, optIndex) => {
        if (this.lang[opt.title] != null) {
          this.root.data[optIndex].title = this.lang[opt.title];
        }
        opt.mode.map((mode, modeIndex) => {
          if (this.lang[mode.name] != null) {
            this.root.data[optIndex].mode[modeIndex].name = this.lang[
              mode.name
            ];
          }
          if ("values" in mode) {
            mode.values.map((val) => {
              if (val in this.presetData == false) {
                this.presetData[val] = JSON.parse(
                  this.$utils.httpGet("http://127.0.0.1:7296/emmm/" + val)
                    .responseText
                );

                if (this.lang[this.presetData[val].title] != null) {
                  this.presetData[val].title = this.lang[
                    this.presetData[val].title
                  ];
                }
                if ("data" in this.presetData[val]) {
                  this.presetData[val].data.map((code, codeIndex) => {
                    if (this.lang[code.name] != null) {
                      this.presetData[val].data[codeIndex].name = this.lang[
                        code.name
                      ];
                    }
                  });
                }
              }
            });
          }
          if ("buttons" in mode) {
            mode.buttons.map((btn) => {
              if (btn in this.presetData == false) {
                this.presetData[btn] = JSON.parse(
                  this.$utils.httpGet("http://127.0.0.1:7296/emmm/" + btn)
                    .responseText
                );

                if (this.lang[this.presetData[btn].title] != null) {
                  this.presetData[btn].title = this.lang[
                    this.presetData[btn].title
                  ];
                }
              }
            });
          }
        });
      });
    },
    disconnectDevice: function() {
      if (this.session != null) {
        this.$utils.httpPost(
          "http://127.0.0.1:7296/dev/API/DEVICES/",
          JSON.stringify({
            cmd: "disconnect",
            session: this.session,
          })
        );
        location.reload();
      }
      this.session = null;
    },
    chooseLanguage: function(indexLang) {
      this.selectedLangIndex = indexLang;
      this.lang = this.connLang.data[this.selectedLangIndex].data;
      localStorage.setItem("langIndex", this.selectedLangIndex);
    },

    modeWrite: function(numIndex) {
      console.log("modeWrite srart");
      var newModeIndex = this.myData[this.selectedCmdIndex].data[numIndex]
        .selectedModeIndex;
      var modeIndex = this.active.mode;
      this.active.data = numIndex;
      this.active.mode = newModeIndex;
      if (
        !(
          this.active.mode in
          this.myData[this.selectedCmdIndex].data[numIndex].mode
        )
      ) {
        this.myData[this.selectedCmdIndex].data[numIndex].mode[
          this.active.mode
        ] = {};
        this.myData[this.selectedCmdIndex].data[numIndex].mode[
          this.active.mode
        ].values = [];
        this.root.data[this.selectedCmdIndex].mode[this.active.mode].values.map(
          (name, indexName) => {
            this.myData[this.selectedCmdIndex].data[numIndex].mode[
              this.active.mode
            ].values[indexName] = this.presetData[name].defVal;
          }
        );
      }
      this.root.data[this.selectedCmdIndex].mode[newModeIndex].values.map(
        (newName, indexNewName) => {
          this.root.data[this.selectedCmdIndex].mode[modeIndex].values.map(
            (name, indexName) => {
              if (
                name == newName &&
                (indexNewName == 0 ||
                  newName !=
                    this.root.data[this.selectedCmdIndex].mode[newModeIndex]
                      .values[indexNewName - 1])
              ) {
                this.myData[this.selectedCmdIndex].data[numIndex].mode[
                  this.active.mode
                ].values[indexNewName] = this.myData[
                  this.selectedCmdIndex
                ].data[numIndex].mode[modeIndex].values[indexName];
              }
            }
          );
        }
      );
      this.active.json = {};
      this.active.keys = [];
      this.active.value = 0;
      this.active.opt = 0;
      this.write();
      this.$forceUpdate();
      console.log("modeWrite end");
      //this.savePresetData();
    },
    //编号  json name  Number   data
    inputCheck: function(numIndex, value, valueIndex, num) {
      this.active.data = numIndex;
      this.active.mode = num.selectedModeIndex;
      this.active.value = num.selectedValue;
      this.write();
      this.unsaved++;
    },

    save: function() {
      var tmpData = null;
      if (this.unsaved != 0) {
        tmpData = JSON.parse(
          this.$utils.httpPost(
            "http://127.0.0.1:7296/API/DEVICES/",
            JSON.stringify({
              cmd: "save",
              session: this.session,
            })
          ).responseText
        );
        if ("message" in tmpData) {
          this.message = tmpData.message;
        } else {
          this.message = "";
        }
        this.unsaved = 0;
      }
    },
    write: function() {
      var sendData = JSON.stringify({
        cmd: this.root.data[this.selectedCmdIndex].cmd,
        session: this.session,
        method: "write",
        cmd_code:
          this.root.data[this.selectedCmdIndex].cmd_code == null
            ? 0
            : this.root.data[this.selectedCmdIndex].cmd_code,
        data: [
          {
            code: this.root.data[this.selectedCmdIndex].mode[this.active.mode]
              .code,
            number: this.active.data,
            values: this.myData[this.selectedCmdIndex].data[this.active.data]
              .mode[this.active.mode].values,
          },
        ],
      });
      var tmpData = JSON.parse(
        this.$utils.httpPost("http://127.0.0.1:7296/API/DEVICES/", sendData)
          .responseText
      );
      if ("message" in tmpData) {
        this.message = tmpData.message;
      } else {
        this.message = "";
      }
      this.unsaved++;
    },
    setActiveKey: function() {
      var tmpData = null;
      if (this.active.json.multiple_choice == true) {
        this.active.keys.map((val, index) => {
          if (val == true) {
            tmpData += this.active.json.data[index].code;
          }
        });
      } else {
        tmpData = this.active.json.data[this.active.keys[0]].code;
      }
      this.myData[this.selectedCmdIndex].data[this.active.data].mode[
        this.active.mode
      ].values[this.active.value] = tmpData;
      this.write();

      //this.savePresetData();
      this.$forceUpdate();
      this.$refs["chiose-setting-window"].hide();
      this.$bvToast.show("my-toast");
    },
    selectActiveKey: function(keyIndex) {
      if (this.active.json.multiple_choice == true) {
        if (this.active.keys[keyIndex] == true) {
          this.active.keys[keyIndex] = false;
        } else {
          this.active.keys[keyIndex] = true;
        }
      } else {
        this.active.keys[0] = keyIndex;
      }
      this.$forceUpdate();
    },
    //按键编号  json name  Number   data
    setPos: function(numIndex, value, valueIndex, num) {
      this.active.data = numIndex;
      this.active.mode = num.selectedModeIndex;
      this.active.value = valueIndex;
      this.active.json = this.presetData[value];
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      this.myData[this.selectedCmdIndex].data[
        numIndex
      ].selectedValue = valueIndex;
      var tmpActiveKeys = [];
      if (this.presetData[value].multiple_choice == true) {
        this.presetData[value].data.map((val, index) => {
          if (
            val.code &
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[valueIndex]
          ) {
            tmpActiveKeys[index] = true;
          } else {
            tmpActiveKeys[index] = false;
          }
        });
      } else {
        this.presetData[value].data.map((val, index) => {
          if (val.code == num.mode[num.selectedModeIndex].values[valueIndex]) {
            tmpActiveKeys[0] = index;
          }
        });
      }
      this.active.keys = tmpActiveKeys;
      this.activeJson = this.presetData[value];
      this.myData[this.selectedCmdIndex].selectData = numIndex;
    },
    SetColor: function(numIndex, value, valueIndex, num) {
      
      this.active.data = numIndex;
      this.active.mode = num.selectedModeIndex;
      this.active.value = valueIndex;
      this.active.json = this.presetData[value];
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      this.myData[this.selectedCmdIndex].data[
        numIndex
      ].selectedValue = valueIndex;
      
      this.myData[this.selectedCmdIndex].data[this.active.data].mode[
        this.active.mode
      ].values[this.active.value] = document.getElementById("myColor" + numIndex).value;

      this.write();
      //显示已更改
      this.$bvToast.show("my-toast");
    },
    //按键编号  json name  Number   data
    GetColor4Arr: function(numIndex, value, valueIndex, num) {
      var colstr = [];
      for (var i = 0;i<3;i++)
      {
        colstr[i] = num.mode[num.selectedModeIndex].values[valueIndex + i].toString(16);
        if (colstr[i].length == 1)
        {
          colstr[i] = '0' + colstr[i];
        }
      }
      console.log("GetColor4Arr","#" + colstr[0]+colstr[1]+colstr[2]);
      return "#" + colstr[0]+colstr[1]+colstr[2];
    },
    SetColor2Arr: function(numIndex, value, valueIndex, num){
      this.active.data = numIndex;
      this.active.mode = num.selectedModeIndex;
      this.active.value = valueIndex;
      this.active.json = this.presetData[value];
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      this.myData[this.selectedCmdIndex].data[numIndex].selectedValue = valueIndex;
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      var colstr = [];
      this.active.color = document.getElementById("myColor" + numIndex).value;
      colstr[0] = this.active.color.substr(1,2);
      colstr[1] = this.active.color.substr(3,2);
      colstr[2] = this.active.color.substr(5);
      console.log("SetColor2Arr",colstr,this.active.color);
      this.myData[this.selectedCmdIndex].data[this.active.data].mode[
        this.active.mode
      ].values[this.active.value] = parseInt(colstr[0],16);
      this.myData[this.selectedCmdIndex].data[this.active.data].mode[
        this.active.mode
      ].values[this.active.value + 1] = parseInt(colstr[1],16);
      this.myData[this.selectedCmdIndex].data[this.active.data].mode[
        this.active.mode
      ].values[this.active.value + 2] = parseInt(colstr[2],16);

      this.write();
      //显示已更改
      this.$bvToast.show("my-toast");
    },
    //按键编号  json name  Number   data
    GetText4Arr: function(numIndex, value, valueIndex, num) {
      var text ="";
      var text_code = [];
      for (var i=0;(i*2)<num.mode[num.selectedModeIndex].values.length;i++){
        text_code[i] = num.mode[num.selectedModeIndex].values[valueIndex + i*2 +1] + (num.mode[num.selectedModeIndex].values[valueIndex + i*2]*256);
        if (text_code[i] != 0)
        {
          text = text + String.fromCharCode(text_code[i]);
        }
        else
        {
          break;
        }
      }
      console.log("GetText4Arr",text);
      return text;
    },
    SetText2Arr: function(numIndex, value, valueIndex, num){
      this.active.data = numIndex;
      this.active.mode = num.selectedModeIndex;
      this.active.value = valueIndex;
      this.active.json = this.presetData[value];
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      this.myData[this.selectedCmdIndex].data[numIndex].selectedValue = valueIndex;
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      var text_code = [];
      this.active.text = document.getElementById("text" + numIndex).value;
      for (var i=0;(i*2)<num.mode[num.selectedModeIndex].values.length;i++)
      {
          if (i<this.active.text.length)
          {
            text_code[i] = this.active.text.charCodeAt(i);
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2] = parseInt(text_code[i]/256);
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2 +1] = text_code[i]%256;
            console.log(text_code[i]);
          }
          else
          {
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2] = 0;
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2 +1] = 0;
          }
      }

      this.write();
      //显示已更改
      this.$bvToast.show("my-toast");
    },
    //按键编号  json name  Number   data
    GetText4Arr_b: function(numIndex, value, valueIndex, num) {
      var text ="";
      var text_code = [];
      for (var i=0;(i*2)<num.mode[num.selectedModeIndex].values.length;i++){
        text_code[i] = num.mode[num.selectedModeIndex].values[valueIndex + i*2 +1] *256 + (num.mode[num.selectedModeIndex].values[valueIndex + i*2]);
        if (text_code[i] != 0)
        {
          text = text + String.fromCharCode(text_code[i]);
        }
        else
        {
          break;
        }
      }
      console.log("GetText4Arr",text);
      return text;
    },
    SetText2Arr_b: function(numIndex, value, valueIndex, num){
      this.active.data = numIndex;
      this.active.mode = num.selectedModeIndex;
      this.active.value = valueIndex;
      this.active.json = this.presetData[value];
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      this.myData[this.selectedCmdIndex].data[numIndex].selectedValue = valueIndex;
      this.myData[this.selectedCmdIndex].selectData = numIndex;
      var text_code = [];
      this.active.text = document.getElementById("text" + numIndex).value;
      console.log(this.active.text,this.active.text.length,num.mode[num.selectedModeIndex].values.length);
      for (var i=0;(i*2)<num.mode[num.selectedModeIndex].values.length;i++)
      {
          if (i<this.active.text.length)
          {
            console.log(i);
            text_code[i] = this.active.text.charCodeAt(i);
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2 + 1] = parseInt(text_code[i]/256);
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2] = text_code[i]%256;
          }
          else
          {
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2] = 0;
            this.myData[this.selectedCmdIndex].data[this.active.data].mode[
              this.active.mode
            ].values[this.active.value+i*2 +1] = 0;
          }
      }

      this.write();
      //显示已更改
      this.$bvToast.show("my-toast");
    },
    //编号  json name  Number
    sendData: function(numIndex, value) {
      var tmpData = this.presetData[value].sendData;
      tmpData.data[0].number = numIndex;
      tmpData.session = this.session;
      this.$utils.httpPost(
        "http://127.0.0.1:7296/API/DEVICES/",
        JSON.stringify(tmpData)
      ).responseText;
    },
    //						json name  Number   data
    getValueNameList: function(value, valueIndex, num) {
      var tmpValueNameList = "";
      // num.modeIndex模式下valueIndex配置文件的键value的name
      if (this.presetData[value].input_type == "choice") {
        if (this.presetData[value].multiple_choice == true) {
          this.presetData[value].data.map((val) => {
            if (val.code & num.mode[num.selectedModeIndex].values[valueIndex]) {
              tmpValueNameList +=
                '<div class="row row-cols-2"><div class="col text-nowrap"><span class="badge badge-pill badge-success">' +
                val.name +
                '</span></div><div class="col text-nowrap">已设定</div></div>';
            }
          });
          return '<div class="container">' + tmpValueNameList + "</div>";
        } else {
          try {
            this.presetData[value].data.map((val) => {
              if (
                val.code == num.mode[num.selectedModeIndex].values[valueIndex]
              ) {
                tmpValueNameList =
                  '<span class="badge badge-pill badge-success">' +
                  val.name +
                  "</span>" +
                  this.lang.set_;
                throw new Error();
              }
            });
          } catch (error) {
            return tmpValueNameList;
          }
        }
      }
    },
    getValueName: function(value, valueIndex, num) {
      var tmpValueName = "";
      // num.modeIndex模式下valueIndex配置文件的键value的name
      if (this.presetData[value].input_type == "choice") {
        if (this.presetData[value].multiple_choice == true) {
          return this.lang.multiSelectItems_;
        } else {
          try {
            this.presetData[value].data.map((val) => {
              if (
                val.code == num.mode[num.selectedModeIndex].values[valueIndex]
              ) {
                tmpValueName = val.name;
                throw new Error();
              }
            });
          } catch (error) {
            return tmpValueName;
          }
        }
      }
    },

    readCmdConfig: function(cmdIndex) {
      var tmpData = null;
      var timestamp1 = new Date().getTime();
      tmpData = JSON.parse(
        this.$utils.httpPost(
          "http://127.0.0.1:7296/API/DEVICES/",
          JSON.stringify({
            cmd: this.root.data[cmdIndex].cmd,
            session: this.session,
            method: "read",
            cmd_code:
              this.root.data[cmdIndex].cmd_code == null
                ? 0
                : this.root.data[cmdIndex].cmd_code,
          })
        ).responseText
      );

      this.message = "";
      if ("message" in tmpData) {
        this.message = tmpData.message;
        return;
      }
      if (tmpData.status != 0) {
        alert("读取失败了，你知道为什么吗？");
        return;
      }
      var timestamp2 = new Date().getTime();
      this.selectedCmdIndex = cmdIndex;
      this.myData[cmdIndex] = {};
      this.myData[cmdIndex].data = [];
      var rtt =
        (timestamp2 - timestamp1 - 3.8 + (tmpData.data.length === 1 ? 1 : 0)) /
        2 /
        tmpData.data.length;
      this.rttmsg = "当前键盘延迟时间 " + rtt.toFixed(2) + " 毫秒";
      if (rtt < 2) {
        this.rttmsg += "，很棒！继续保持！";
      } else if (rtt > 4) {
        this.rttmsg += "，emmmmm咱觉得你该换个电脑了";
      } else {
        this.rttmsg += "，一般一般，直插电脑USB3.0接口试试？";
      }
      //遍历读取到的data数组
      tmpData.data.map((data, dataIndex) => {
        this.myData[cmdIndex].data[dataIndex] = {};
        this.myData[cmdIndex].data[dataIndex].mode = [];
        //遍历mode数组找到对应的
        this.root.data[cmdIndex].mode.map((mode, modeIndex) => {
          //console.log(mode.code , data.code);
          if (mode.code === data.code) {
            this.myData[cmdIndex].data[dataIndex].selectedModeIndex = modeIndex;
            this.myData[cmdIndex].data[dataIndex].selectedValue = 0;
            this.myData[cmdIndex].data[dataIndex].mode[modeIndex] = {};
            this.myData[cmdIndex].data[dataIndex].mode[modeIndex].values = [];
            if ("values" in mode) {
              mode.values.map((val, indexVal) => {
                if (this.presetData[val].input_type === "choice") {
                  this.presetData[val].data.map((code) => {
                    if (this.presetData[val].multiple_choice === false) {
                      if (code.code === data.values[indexVal]) {
                        this.myData[cmdIndex].data[dataIndex].mode[
                          modeIndex
                        ].values[indexVal] = data.values[indexVal];
                        return false;
                      }
                    } else if (this.presetData[val].multiple_choice === true) {
                      if (code.code & data.values[indexVal]) {
                        this.myData[cmdIndex].data[dataIndex].mode[
                          modeIndex
                        ].values[indexVal] |= data.values[indexVal];
                        return false;
                      }
                    }
                  });
                  if (
                    !(
                      indexVal in
                      this.myData[cmdIndex].data[dataIndex].mode[modeIndex]
                        .values
                    )
                  ) {
                    this.myData[cmdIndex].data[dataIndex].mode[
                      modeIndex
                    ].values[indexVal] = this.presetData[val].defVal;
                  }
                } else {
                  this.myData[cmdIndex].data[dataIndex].mode[modeIndex].values[
                    indexVal
                  ] = data.values[indexVal];
                }
              });
            }
            return false;
          }
        });
        if (!("selectedModeIndex" in this.myData[cmdIndex].data[dataIndex])) {
          //如果没有对应的模式就加载默认值
          console.log("没有匹配的mode设定，载入默认值");
          this.myData[cmdIndex].data[dataIndex].selectedModeIndex = 0;
          this.myData[cmdIndex].data[dataIndex].selectedValue = 0;
          this.myData[cmdIndex].data[dataIndex].mode[0] = {};
          this.myData[cmdIndex].data[dataIndex].mode[0].values = [];
          this.root.data[cmdIndex].mode[0].values.map((val, indexVal) => {
            this.myData[cmdIndex].data[dataIndex].mode[0].values[
              indexVal
            ] = this.presetData[val].defVal;
          });
        }
      });
      this.activeKeyList = 0;
      this.myData[cmdIndex].selectData = 0;
      this.readOK = 1;
      this.active.json = {};
      this.active.keys = [];
      this.active.opt = 0;
      this.active.data = 0;
      this.active.mode = 0;
      this.active.value = 0;
      //console.log(this.myData);
      //console.log(this.root.data[this.selectedCmdIndex].mode[this.myData[this.selectedCmdIndex].data[0].selectedModeIndex].values);
    },
    uriOpen: function(uri) {
      window.open(uri, "target", "");
    },
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
