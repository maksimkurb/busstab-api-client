'use strict';

/* ----- Define GraphQL requests ----- */
//#region GraphQL Requests
//-- Password requests
const PASSPORT_REQUEST_BASIC = `
mutation($basicInput: PassportRequestBasicInput!) {
  passportCheck(basic: $basicInput) {
    id
    stage
    createdAt
    level
    payload {
      passportIsDeprecated
      INN
      MRZ
      remarks {
        severity
        message
        code
      }
    }
  }
}`;
const PASSPORT_REQUEST_COMPLEX = `
mutation($complexInput: PassportRequestComplexInput!) {
  passportCheck(complex: $complexInput) {
    id
    stage
    createdAt
    level
    payload {
      passportIsDeprecated
      INN
      MRZ
      remarks {
        severity
        message
        code
      }
    }
  }
}`;
const PASSPORT_REQUEST_FULL = `
mutation($fullInput: PassportRequestFullInput!) {
  passportCheck(full: $fullInput) {
    id
    stage
    createdAt
    level
    payload {
      passportIsDeprecated
      INN
      MRZ
      remarks {
        severity
        message
        code
      }
    }
  }
}`;
//-- Company search
const COMPANY_SEARCH_REQUEST = `
mutation($input: CompanySearchRequestInput!) {
  companySearch(input: $input) {
    id
    user {
      id
      email
      nickname
    }
    stage
    payload {
      companies {
        id
        status
        OGRN
        INN
        KPP
        OKPO
        name {
          fullName
          shortName
          brandName
        }
        registrationType
      }
    }
    createdAt
    updatedAt
  }
}`;
//#endregion

/* ----- Make request logic ----- */
//#region Request execution

const GRAPHQL_ENDPOINT = "https://api.busstab.ru/graphql";

/**
 * Helper function that returns form data
 */
function getFormData() {
    const form = document.querySelector('form.request-form');
    const formData = new FormData(form);
    var data = {};
    formData.forEach((value, key) => {data[key] = value});
    return data;
}

/**
 * Performs a request to GraphQL endpoint
 * @param query Request query
 * @param variables Request variables data
 */
function makeRequest(query, variables) {
    const body = {
        query: query,
        variables: variables
    };

    console.log('[START] Request with body: ', body);

    const result = fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            "Authorization": "Bearer " + getAuthToken(),
            "Content-Type": "application/json",
        },
    })
        .then(resp => resp.json()); // Parse response JSON

    result
        .then((resp) => {
            console.log('[SUCCESS]', resp);
            const el = document.querySelector("#results > pre");
            el.innerHTML = JSON.stringify(resp, null, 4);
            hljs.highlightBlock(el);
            return resp;
        })
        .catch((err) => {
            console.error('[ERROR]', err);
        });

    return result;
}
function makePassportRequest() {
    const data = getFormData();


    let input;

    let query;
    switch (data.level) {
        case "basic":
            query = PASSPORT_REQUEST_BASIC;
            input = {
                basicInput: {
                    passportNumber: data.passportNumber,
                    passportSeries: data.passportSeries,
                }
            };
            break;
        case "complex":
            query = PASSPORT_REQUEST_COMPLEX;
            input = {
                complexInput: {
                    passportNumber: data.passportNumber,
                    passportSeries: data.passportSeries,

                    birthDate: data.birthDate,
                    birthPlace: data.birthPlace,
                    firstName: data.firstName,
                    gender: data.gender,
                    lastName: data.lastName,
                    passportIssueDate: data.passportIssueDate,
                    patronymic: data.patronymic,
                }
            };
            break;
        case "full":
        default:
            query = PASSPORT_REQUEST_FULL;
            input = {
                fullInput: {
                    passportNumber: data.passportNumber,
                    passportSeries: data.passportSeries,

                    birthDate: data.birthDate,
                    birthPlace: data.birthPlace,
                    firstName: data.firstName,
                    gender: data.gender,
                    lastName: data.lastName,
                    passportIssueDate: data.passportIssueDate,
                    patronymic: data.patronymic,

                    passportDivisionCode: data.passportDivisionCode
                }
            };
    }

    makeRequest(query, input);
}
//#endregion

jQuery(() => {
    $('form#passport-request-form #sumbit-request').on('click', makePassportRequest);
    $('input[name=level]').on('change', function (e) {
        var container = $(".disp-container");
        container.removeClass("disp-basic");
        container.removeClass("disp-complex");
        container.removeClass("disp-full");
        var level = e.currentTarget.value;

        container.addClass('disp-'+level);

    });
});