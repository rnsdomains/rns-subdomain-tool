(function () {
    'use strict';

    const constants = {
        parentDomain : ".example.rsk",
        title: "Example",
        logoClickUrl: "http://www.rsk.co"
    }

    const EXPLORER_TX_URL = "https://explorer.rsk.co/tx/";
    const API_URL = 'http://127.0.0.1:3001';

    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    function avoidEnterKey(e) {
        if (e.which == 13) {
            return false;
        }
    }

    function registerClick() {
        var addr = $("#address").val();
        var mail = $("#mail").val();
        var domain = $("#domain").val();
        var captcha = $("#g-recaptcha-response").val();
        $("#registerValidationMessage").text('');

        if (!captcha) {
            var text = "Please confirm you're not a robot";
            $("#registerValidationMessage").text(text);
            $.growl.error({ message: text });
            return;
        }
        if (addr == "" && domain != "") {
            $("#address").addClass("is-invalid was-validated");
            $("#domain").addClass("is-valid was-validated");
            $.growl.error({ message: "An RSK address is required" });
            return;
        }
        if (addr != "" && domain == "") {
            $("#address").addClass("is-valid was-validated");
            $("#domain").addClass("is-invalid was-validated");
            $.growl.error({ message: "A domain name is required" });
            return;
        }
        if (addr == "" && domain == "") {
            $("#address").addClass("is-invalid was-validated");
            $("#domain").addClass("is-invalid was-validated");
            $.growl.error({ message: "An RSK address is required" });
            $.growl.error({ message: "A domain name is required" });
            return;
        }
        if (addr != "" && domain != "") {
            $("#address").addClass("is-valid was-validated");
            $("#domain").addClass("is-valid was-validated");
            $.LoadingOverlay("show");
            var url =  API_URL + '/setSubdomainNode';
            domain = domain + constants.parentDomain;

            var data = { "address": addr, "domain": domain.toLowerCase(), "mail": mail, "g-recaptcha-response": captcha };
            return sendRequest("POST", url, data, registerDomainResult);
        };
    }

    function checkDomainStatus() {
        var domainName = $("#domain").val();
        if (domainName == "") {
            removeClassesForm();
            $("#domainStatusCheckedDetails").addClass("display-none");
            $("#domainStatusChecked").addClass("display-none");
            $("#domain").addClass("is-invalid was-validated");
            $.growl.error({ message: "A domain name is required" });
        }
        else {
            $.LoadingOverlay("show");
            var url = API_URL + '/subdomainStatus';
            var domainName = domainName + constants.parentDomain;
            var data = { "subdomain": domainName };
            sendRequest("GET", url, data, checkDomainStatusResult);
        }
    }

    $("form").keypress(avoidEnterKey);
    $("#formRegister").submit(function () {
        event.preventDefault();
        registerClick()
    });
    $("#btnCheckStatus").click(checkDomainStatus);
    $("#domain").keyup(function (e) {
        if (e.keyCode == 13) {
            checkDomainStatus();
        }
        else {
            registerHide();
            removeClassesForm();
        }
    });

    function txResult(result) {
        if (result.status == "FAILED") {
            $("#txStatusPending").LoadingOverlay("hide", true);
            $("#txStatusPending").hide();
            $("#txStatusFailed").show();
            $("#txStatusFailedMessage").show();
            window.localStorage.removeItem('registrationInProgress');
            return;
        }
        // SUCCESS
        $("#txStatusPending").LoadingOverlay("hide", true);
        $("#txStatusPending").hide();
        $("#txStatusSuccess").show();
        $("#txStatusSuccessMessage").show();
        window.localStorage.removeItem('registrationInProgress');
    }

    function txStatus(txHash, cb) {
        var url =  API_URL + '/transactionStatus';
        var data = { "txHash": txHash };
        sendRequest("GET", url, data, function (result) {
            if (result.code == 200) {
                if (result.body.status == "NOT_FOUND") {
                    setTimeout(function () {
                        return txStatus(txHash, cb);
                    }, 4000);
                    return;
                }
                cb(result.body)
            }
        })
    }

    function setParentDomainInfo() {
        $("#parentDomainCheckStatusForm").text(constants.parentDomain);
        $("#parentDomain").text(constants.parentDomain);
        $("#linkLogoCustom").attr("href", constants.logoClickUrl);
        $("#domainName").text(constants.title);
    }

    function saveLocalStorage(txHash) {
        var data = {};
        data.txHash = txHash;
        data.mail = $("#mail").val();
        data.address = $("#address").val();
        data.domain = $("#domain").val();
        var dataToSave = JSON.stringify(data);
        window.localStorage.setItem('registrationInProgress', dataToSave);
    }

    function loadInProgressTxScreen(data) {
        $("#address").val(data.address);
        $("#mail").val(data.mail);
        $("#domain").val(data.domain);
        registerHide();
        domainIsAvailable();
        showTxProgress(data.txHash);
    }

    var config = {
        "custom": {
            "parentDomain" : ".example.rsk",
            "title": "Example",
            "logoClickUrl": "http://www.rsk.co"
        }
    };

    function registerHide() {
        $("#divBtnCheckStatus").show();
        $('#register-form').hide();
        $("#address").removeClass("is-invalid is-valid was-validated");

        $("#registerValidationMessage").text('');
        $("#captchaInputText").val('');
        $("#txStatusPending").hide();
        $("#txStatusSuccess").hide();
        $("#txStatusFailed").hide();
        $("#txStatusFailedMessage").hide();
        $("#txStatusSuccessMessage").hide();
        $("#txContainer").hide();
    }

    function removeClassesForm() {
        $("#domain").removeClass("is-valid was-validated");
        $("#domain").removeClass("is-invalid was-validated");
        $("#domainStatusCheckedAvailable").hide();
        $("#domainStatusCheckedOwned").hide();
        $("#checkValidationMessage").text('');
        $("#captchaInputText").val('');
    }

    // Results functions
    function domainIsAvailable() {
        $('#register-form').show();
        $("#domain").addClass("is-valid was-validated");
        $("#divBtnCheckStatus").hide();
    }

    function domainIsOwned(who) {
        $("#address").val('');
        $("#mail").val('');
        $("#domain").addClass("is-invalid was-validated");
        $("#ownedBy").text(" by " + who);
        $("#domainStatusCheckedOwned").show();
    }

    function checkDomainStatusResult(result) {
        $("#register-form").hide();
        $("#address").val('');
        $("#mail").val('');
        removeClassesForm();
        var text;
        if (result.code == 200) {
            text = 'It is ' + result.body.status.status
            if (result.body.status.status == "AVAILABLE") {
                domainIsAvailable();
                $.growl.notice({ duration: "4000", message: text });
            }
            else if (result.body.status.status == "OWNED") {
                domainIsOwned(result.body.status.owner);
                $.growl.warning({ duration: "4000", message: text });
            }
            $.LoadingOverlay("hide");
            return;
        }
        else if (result.code == 400) {
            text = "Validation error: " + result.body.details + "."
        }
        else if (result.code == 500) {
            text = "The domain could not be checked. Details: " + result.body.details;
        }
        else if (result.code == 429) {
            text = "Please, try again later."
        }
        else {
            text = "An unexpected error has ocurred.";
        }
        $("#checkValidationMessage").text(text);
        $.growl.error({ duration: "4000", message: text });
        $.LoadingOverlay("hide");
        return;
    }

    function reduceTxHash(txHash) {
        return txHash.substr(0, 6) + "...." + txHash.substr(txHash.length - 6, 6)
    }

    function showTxProgress(txHash) {
        $("#txContainer").show();
        $("#txHashRegisteredDomain").text(reduceTxHash(txHash));
        var href = EXPLORER_TX_URL + txHash;
        $("#txHashRegisteredDomain").attr("href", href);
        $("#txStatusPending").show();
        $.LoadingOverlay("hide");
        $("#txStatusPending").LoadingOverlay("show");

        txStatus(txHash, txResult);
    }

    function registerDomainResult(result) {
        var text;
        $("#registerValidationMessage").text('');
        var statusResponse = result.code;
        if (statusResponse == 200) {
            var txHash = result.body.txHash;
            saveLocalStorage(txHash);
            showTxProgress(txHash);
            return;
        }
        else if (statusResponse == 400) {
            text = "Validation error: " + result.body.details + "."
            $("#address").removeClass("is-valid is-invalid was-validated");
            $("#domain").removeClass("is-valid is-invalid was-validated");
        }
        else if (statusResponse == 500) {
            text = "Domain registration could not be completed. Details: " + result.body.details;
        }
        else if (result.code == 429) {
            text = "Please, try again later."
        }
        else {
            text = "An unexpected error has ocurred";
        }
        $("#registerValidationMessage").text(text);
        grecaptcha.reset();
        $.LoadingOverlay("hide");
        $.growl.error({ duration: "4000", message: text });
        return;
    }
})();