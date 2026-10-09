/* Student Registration Form with Input Validation
   ITP10 - Event-Driven Programming | Laboratory Activity 3 */

"use strict";

/* ---------- Regular expressions ---------- */
var STUDENT_NUMBER_REGEX = /^\d{2}-\d{4}-\d{3}$/;
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MOBILE_REGEX = /^(09|\+639)\d{9}$/;
var PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/;

/* ---------- Pure validation functions (no DOM access) ---------- */
function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return STUDENT_NUMBER_REGEX.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  return PASSWORD_REGEX.test(value); // passwords are never trimmed
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim());
}

function isValidMobileNumber(value) {
  return typeof value === "string" && MOBILE_REGEX.test(value.trim());
}

/* ---------- Browser-only code ---------- */
if (typeof document !== "undefined") {
  (function () {
    var SUCCESS_TEXT = "Registration details validated successfully!";

    var form = document.getElementById("registrationForm");
    var fields = {
      fullName: document.getElementById("fullName"),
      studentNumber: document.getElementById("studentNumber"),
      email: document.getElementById("email"),
      mobileNumber: document.getElementById("mobileNumber"),
      password: document.getElementById("password"),
      confirmPassword: document.getElementById("confirmPassword"),
      course: document.getElementById("course"),
      terms: document.getElementById("terms")
    };
    var passwordFeedback = document.getElementById("passwordFeedback");
    var successMessage = document.getElementById("successMessage");
    var summary = document.getElementById("registrationSummary");

    /* Each checker returns an error message, or "" when the value is valid. */
    var checkers = {
      fullName: function () {
        var v = fields.fullName.value.trim();
        if (v === "") return "Enter your full name.";
        if (v.length < 2) return "Full name must be at least 2 characters.";
        return "";
      },
      studentNumber: function () {
        var v = fields.studentNumber.value.trim();
        if (v === "") return "Student number is required.";
        if (!isValidStudentNumber(v)) return "Enter a student number in the format 24-1234-123.";
        return "";
      },
      email: function () {
        var v = fields.email.value.trim();
        if (v === "") return "Email address is required.";
        if (!isValidEmail(v)) return "Enter a valid email such as name@example.com (no spaces).";
        return "";
      },
      mobileNumber: function () {
        var v = fields.mobileNumber.value.trim();
        if (v === "") return "Mobile number is required.";
        if (!isValidMobileNumber(v)) return "Enter 09 or +639 followed by nine digits, with no spaces or hyphens.";
        return "";
      },
      password: function () {
        var v = fields.password.value;
        if (v === "") return "Password is required.";
        if (!isValidPassword(v)) return "Password must be 8+ characters with an uppercase letter, a digit, one of @ $ !, and no spaces.";
        return "";
      },
      confirmPassword: function () {
        var v = fields.confirmPassword.value;
        if (v === "") return "Please confirm your password.";
        if (v !== fields.password.value) return "Passwords do not match.";
        return "";
      },
      course: function () {
        var v = fields.course.value;
        if (v !== "BSIT" && v !== "BSCS") return "Select your course (BSIT or BSCS).";
        return "";
      },
      terms: function () {
        return fields.terms.checked ? "" : "You must agree to the terms to register.";
      }
    };

    var order = ["fullName", "studentNumber", "email", "mobileNumber",
                 "password", "confirmPassword", "course", "terms"];

    function showError(name, message) {
      var errorEl = document.getElementById(name + "Error");
      errorEl.textContent = message;
      fields[name].setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateField(name) {
      var message = checkers[name]();
      showError(name, message);
      return message === "";
    }

    function hasError(name) {
      return document.getElementById(name + "Error").textContent !== "";
    }

    function clearOutput() {
      successMessage.textContent = "";
      successMessage.hidden = true;
      summary.hidden = true;
      ["summaryName", "summaryStudentNumber", "summaryEmail",
       "summaryMobileNumber", "summaryCourse"].forEach(function (id) {
        document.getElementById(id).textContent = "";
      });
    }

    /* Live password feedback: lists each rule as met / not met. */
    function updatePasswordFeedback() {
      var v = fields.password.value;
      passwordFeedback.textContent = "";
      if (v === "") return;
      var rules = [
        ["At least 8 characters", v.length >= 8],
        ["One uppercase letter", /[A-Z]/.test(v)],
        ["One digit", /\d/.test(v)],
        ["One of @, $ or !", /[@$!]/.test(v)],
        ["No spaces", !/\s/.test(v)]
      ];
      var heading = document.createElement("span");
      heading.textContent = isValidPassword(v)
        ? "Password meets all requirements."
        : "Password does not meet all requirements yet:";
      var list = document.createElement("ul");
      rules.forEach(function (r) {
        var li = document.createElement("li");
        li.className = r[1] ? "met" : "unmet";
        li.textContent = (r[1] ? "\u2713 Met: " : "\u2717 Not met: ") + r[0];
        list.appendChild(li);
      });
      passwordFeedback.appendChild(heading);
      passwordFeedback.appendChild(list);
    }

    function showSummary() {
      document.getElementById("summaryName").textContent = fields.fullName.value.trim();
      document.getElementById("summaryStudentNumber").textContent = fields.studentNumber.value.trim();
      document.getElementById("summaryEmail").textContent = fields.email.value.trim();
      document.getElementById("summaryMobileNumber").textContent = fields.mobileNumber.value.trim();
      document.getElementById("summaryCourse").textContent = fields.course.value;
      successMessage.textContent = SUCCESS_TEXT;
      successMessage.hidden = false;
      summary.hidden = false;
    }

    /* ----- submit ----- */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearOutput();
      var firstInvalid = null;
      order.forEach(function (name) {
        if (!validateField(name) && !firstInvalid) firstInvalid = fields[name];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      showSummary();
    });

    /* ----- input: live password feedback (+ keep confirm in sync) ----- */
    fields.password.addEventListener("input", function () {
      updatePasswordFeedback();
      if (hasError("password")) validateField("password");
      if (fields.confirmPassword.value !== "" || hasError("confirmPassword")) {
        validateField("confirmPassword");
      }
    });

    /* ----- blur: full name ----- */
    fields.fullName.addEventListener("blur", function () {
      validateField("fullName");
    });

    /* ----- change: course and terms ----- */
    fields.course.addEventListener("change", function () { validateField("course"); });
    fields.terms.addEventListener("change", function () { validateField("terms"); });

    /* ----- recheck a field as it is corrected so its error clears ----- */
    ["fullName", "studentNumber", "email", "mobileNumber", "confirmPassword"].forEach(function (name) {
      fields[name].addEventListener("input", function () {
        if (hasError(name)) validateField(name);
      });
    });

    /* ----- reset ----- */
    form.addEventListener("reset", function () {
      order.forEach(function (name) { showError(name, ""); });
      passwordFeedback.textContent = "";
      clearOutput();
    });
  })();
}

/* ---------- Export for Node (autograder function tests) ---------- */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber: isValidStudentNumber, isValidPassword: isValidPassword };
}
