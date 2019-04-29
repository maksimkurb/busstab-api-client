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
//-- Company search
const COMPANY_INFO_REQUEST = `
mutation($input: CompanyInfoRequestInput!) {
  companyInfo(input: $input) {
    id
    stage
    payload {
      company {
        id
        activities {
          name
          code
          redaction
          fnsDate
          GRN
        }
        
        directorHistory {
          start
          end
          director {
            job
            person {
              lastName
              firstName
              patronymic
            }
          }
          
        }
        
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
        registrationDate
        registrationType
        registrationAddress
        registrationAddressKLADR
        liquidationDate
        liquidationType
        authorizedCapital
        mainActivity
        directors {
          person {
            lastName
            firstName
            patronymic
            birthDate
            birthPlace
            gender
            id
          }
          job
          bad
        }
        founderHistory {
          founder {
            capitalContribution
            encumbrance {
              type
            }
            ... on CompanyFounder {
              company {
                name {
                  fullName
                }
              }
            }
            ... on PersonFounder {
              person {
                firstName
              }
            }
          }
        }
        
      }
    }
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
//#endregion
