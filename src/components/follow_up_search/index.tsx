import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Image from "next/image";

import { ISearchQuery } from "@/constant/interfaces";

const FollowUpSearch = ({
  showType = false,
  value,
  setValue,
  loading,
}: {
  showType: boolean;
  value: ISearchQuery;
  setValue: Dispatch<SetStateAction<ISearchQuery>>;
  loading: boolean;
}) => {
  const [dataSources, setDataSources] = useState([]);
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || process.env.ENDPOINT;
  
  useEffect(() => {
    fetch(endpoint + "database/get_data_sources/")
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Ensure the data format is as expected
        if (data && Array.isArray(data.data_source_names)) {
          setDataSources(data.data_source_names);
        } else {
          throw new Error("Data format is incorrect");
        }
      })
      .catch((error) => {
        console.error("Error fetching data sources:", error);
        setDataSources([]);
      });
  }, []);

  return (
    <div className="flex">
      <select
        id="large"
        className="block w-1/4 min-w-48 px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        value={value.datasources[0] || ""}
        onChange={(e) => setValue({ ...value, datasources: [e.target.value] })}
      >
        <option value="">Select</option>
        {dataSources.map((name, index) => (
          <option key={index} value={name}>
            {name}
          </option>
        ))}
      </select>

      <div className="max-w-5xl relative pl-4">
        <input
          className="search-input"
          type="text"
          name="search"
          id="search"
          value={value.query}
          placeholder="Ask your question here..."
          onChange={(e) => setValue({ ...value, query: e.target.value })}
        />
        <button disabled={loading} style={{ right: "20px" }}>
          <Image
            priority
            src="/svg/submiit.svg"
            height={43}
            width={43}
            alt="Submit"
            style={{ opacity: loading ? 0.5 : 1 }}
          />
        </button>
      </div>
    </div>
  );
};

export default FollowUpSearch;
