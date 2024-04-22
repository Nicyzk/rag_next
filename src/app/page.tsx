"use client";
import { useEffect, useCallback, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InitialSearch from "./search/initialSearch";
import { IChat, ISearchQuery } from "@/constant/interfaces";
import { collapasMenu } from "@/lib/utils";

const Home = () => {
    return (
        <Suspense fallback={<>Loading...</>}>
            <HomePage />
        </Suspense>
    )
}

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState<ISearchQuery>({ query: "", datasources: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(name, value);
  
      return params.toString();
    },
    [searchParams]
  );

  const handleSubmitQuery = async (query: string, datasources: string[], continuation: boolean) => {
    collapasMenu()
    const queryString = createQueryString("question", query);
    const dataSourceString = datasources.length > 0 ? createQueryString("datasources", datasources.join(",")) : "";
    router.push(`/search?${queryString}&${dataSourceString}`, { scroll: false });
  };

  return (
    <>
      <InitialSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSubmitQuery={handleSubmitQuery}
        loading={loading}
      />
    </>
  );
};

export default Home;
