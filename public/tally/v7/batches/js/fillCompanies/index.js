async function fetchData(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        // Captures network failures or thrown errors from above
        console.error("Fetch operation failed:", error);
    }
};

const startFunc = async () => {

    const fetchUrl = `/v2/ws/company`;

    const data = await fetchData(fetchUrl);

    const companies = data?.data.map(company => {
        return { Name: company };
    });

    window.ks.jsonRenderers.render({
        type: "selectOptionsOnly", appendPosition: "prepend",
        data: companies,
        columns: [
            { columnName: "Name" }
        ],
        targetHtmlId: "companySelect",
        classToApply: ""
    });
};

export default startFunc;