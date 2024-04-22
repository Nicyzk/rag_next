import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";

import SearchInput from "@/components/search";
import { ISearchQuery } from "@/constant/interfaces";
import Image from "next/image";

const InitialSearch = ({
  searchQuery,
  setSearchQuery,
  handleSubmitQuery,
  loading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitQuery(searchQuery.query, searchQuery.datasources, false);
  };

  return (
    <form
      className={`search flex  search-vh justify-center items-center flex-col` }
      onSubmit={handleSubmit}
    >
      <SearchInput
        showType={searchQuery.query.length > 0}
        value={searchQuery}
        setValue={setSearchQuery}
        loading={loading}
      />
    </form>
  );
};

export default InitialSearch;
