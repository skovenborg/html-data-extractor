module.exports = EuropaParser

const STATE = {
  NONE: 0,
  LABEL: 1,
  FIELD: 2,
  PROFILE_BOX: 3,
  H3: 4,
  PROFILE_BOX_INFO: 5,
  MULTIPLE_VALUE_FIELD: 6,
  PERSON_INFO_BOX: 7
}

function EuropaParser() {
  this._state = STATE.NONE;

  this._currentField = null;
  this.json = {}
  this._tmpValue = '';
  this._pboxCounter = 0;
}

//Personer akkrediteret ved Europa-Parlamentet

EuropaParser.prototype.onopentag = function(name, attr) {
  if (name === 'td') {
    if (this._state == STATE.PERSON_INFO_BOX) {
      return;
    }
    else if (attr.class && attr.class.toLowerCase() === 'formulairelabel' && this.json[this._currentField] !== null) {
      this._state = STATE.LABEL;
      //this._currentField = null;
    }
    else if (attr.class && attr.class.toLowerCase() === 'formulairefield') {
      this._state = (this._state === STATE.MULTIPLE_VALUE_FIELD) ? STATE.MULTIPLE_VALUE_FIELD : STATE.FIELD;
    }
  }
  if (name === 'h3') {
    this._state = STATE.H3;
  }
}

EuropaParser.prototype.onclosetag = function(name) {
  if (this._state === STATE.MULTIPLE_VALUE_FIELD && name === 'ul') {
    this._state = STATE.NONE;
  }
  
  if (this._state === STATE.FIELD && name === 'tr' && this._currentField) {
    this.json[this._currentField] = this._tmpValue.replace(/[\r\n]|[ ]{2,}/g,'');
    this._tmpValue = '';
    this._state = STATE.NONE
    this._currentField = null;
  }
}

EuropaParser.prototype.ontext = function(text) {
  text = text.trim().replace(/\&nbsp;/ig,' ')
  if (this._state !== STATE.FIELD && !text) return; // empty strings is not interesting

  switch (this._state) {
    case STATE.LABEL:
      this._handleLabelText(text)
      break;
    case STATE.PROFILE_BOX:
      this._handleProfileBoxText(text);
      break;
    case STATE.PROFILE_BOX_INFO:
      this.json[this._currentField] = text;
      this._state = STATE.PROFILE_BOX
      break;
    case STATE.FIELD:
      this._tmpValue += text;
      break;
    case STATE.MULTIPLE_VALUE_FIELD:
      this.json[this._currentField].push(text);
      break;
    case STATE.H3:
      if (text === 'Registreredes profil') {
        this._state = STATE.PROFILE_BOX;
      } else if (text === 'Personer akkrediteret ved Europa-Parlamentet') {
        this._state = STATE.PERSON_INFO_BOX;
        this._currentField = 'Personer_akkrediteret_ved_Europa_Parlamentet';
      } else {
        this._state = STATE.NONE;
      }
      break;
    default:
      break;
  }
}

EuropaParser.prototype._handleLabelText = function(text) {
  var matches = text.match(/([\wæøå ]+)[\.:]?/i);
  if (matches && matches.length > 0) {
    this._currentField = matches[1];
    this._currentField = this._currentField.replace(/æ/ig,'ae').replace(/ø/ig,'oe').replace(/å/ig,'aa').replace(/ /g,'_')
    if (this._currentField === 'Organisationen_har_interesser_paa'
         || this._currentField === 'Organisationens_interesseomraader'
         || this._currentField === 'Organisationen_repraesenterer_interesser_paa') {
      this._state = STATE.MULTIPLE_VALUE_FIELD;
      this.json[this._currentField] = []
    }
  }
}

EuropaParser.prototype._handleProfileBoxText = function(text) {
  if (text.indexOf('Identifikationsnummer i registret') == 0) {
    this._currentField = 'Identifikationsnummer';
    this._state = STATE.PROFILE_BOX_INFO;
  }
  if (text.indexOf('Registreringsdato') == 0) {
    this._currentField = 'Registreringsdato';
    this._state = STATE.PROFILE_BOX_INFO;
  }
  if (text.indexOf('Seneste ændring af oplysningerne om denne organisation') == 0) {
    this._currentField = 'Seneste_aendring';
    this._state = STATE.PROFILE_BOX_INFO
  }
  if (text.indexOf('Seneste årlige opdatering') == 0) {
    this._currentField = 'Seneste_aarlige_opdatering';
    this._state = STATE.PROFILE_BOX_INFO
  }
}
