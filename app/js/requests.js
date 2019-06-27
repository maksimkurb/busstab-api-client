"use strict";

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
  companySearch(input: $input, options: { timeout: 30 }) {
    id
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
//-- Company info
const COMPANY_INFO_REQUEST = `
fragment CompanyInfo on Company {
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
fragment PersonInfo on Person {
	id
  lastName
  firstName
  patronymic
  birthDate
  birthPlace
  gender
}
fragment EncumbraceInfo on Encumbrace {
	type
  end
  documentNumber
  documentDate
  GRN
  pawnbroker {
    __typename
    ...on Company {
      ...CompanyInfo
    }
    ... on Person {
      ...PersonInfo
    }
  }
  notary {
    ...PersonInfo
  }
}
fragment FounderInfo on IFounder {
  capitalContribution
  encumbrance {
    ...EncumbraceInfo
  }
  ... on CompanyFounder {
    company {
      ...CompanyInfo
    }
  }
  ... on PersonFounder {
    person {
      ...PersonInfo
    }
  }
  ... on ForeignCompanyFounder {
    fullName
    INN
    country
    regNumber
    regAuthority
    GRN
  }
  ... on MOFounder {
    fullName
    region
    fnsDate
    GRN
    managementCompany {
      ...CompanyInfo
    }
  }
  ... on PIFFounder {
    fullName
    fnsDate
    GRN

    managementCompany {
      ...CompanyInfo
    }
  }
}

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
        
        phones {
          fax
          number
          updated
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
            ...PersonInfo
          }
          job
          bad
        }
      	founders {
            __typename
          ...FounderInfo
        }
        founderHistory {
          start
          end
        	founder {
            __typename
            ...FounderInfo
          }
        }
        directorHistory {
          start
          end
          director {
            person {
              ...PersonInfo
            }
            job
            bad
          }
        }
      }
    }
  }
}`;
// -- RNP
const RNP_REQUEST = `
mutation($input: RnpRequestInput!) {
  rnp(input: $input) {
    stage
    payload {
      records {
        INN
        registryNumber
        reason
        agency
        inclusionDate
        exclusionDate
        purchaseNumber
        contractNumber
        law
        url
      }
    }
  }
}`;
// -- FSSP
const FSSP_REQUEST = `
mutation($input: FsspRequestInput!) {
  fssp(input: $input, options: {timeout: 30}) {
    id
    stage
    payload {
      proceedings {
        companyId
        companyOGRN
        companyINN
        companyName
        companyAddress
        number
        date
        summaryProcNumber
        documentType
        documentDate
        documentNumber
        documentObject
        object
        amount
        debt
        departmentName
        departmentAddress
        postIndex
        regionCode
        id
      }
      summary {
        active
        canceled
        completed
      }
      summaryPerYear {
        year
        count
        activeAmount
        canceledAmount
        completedAmount
      }
    }
  }
}`;
// -- Arbitr
const ARBITR_REQUEST = `
mutation($input:ArbitrCourtRequestInput!) {
  arbitrCourt(input: $input) {
    id
    stage
    payload {
      availableCasesSummaries {
        count
        amount
        type
        party
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
  const form = document.querySelector("form.request-form");
  const formData = new FormData(form);
  var data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
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

  console.log("[START] Request with body: ", body);
  const el = document.querySelector("#results > pre");
  el.innerHTML = "Идёт запрос на сервер...";

  const result = fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Authorization: "Bearer " + getAuthToken(),
      "Content-Type": "application/json"
    }
  }).then(resp => resp.json()); // Parse response JSON

  result
    .then(resp => {
      console.log("[SUCCESS]", resp);
      el.innerHTML = JSON.stringify(resp, null, 4);
      hljs.highlightBlock(el);
      return resp;
    })
    .catch(err => {
      console.error("[ERROR]", err);
      el.innerHTML = "Ошибка запроса, смотрите консоль    ";
    });

  return result;
}
//#endregion
