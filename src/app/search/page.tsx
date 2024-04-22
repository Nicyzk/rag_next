"use client";

import FollowUpSearch from "@/components/follow_up_search";
import { useEffect, useRef, useState, useCallback, FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DOMPurify from "dompurify";
import { marked } from "marked";

import { IChat, ISearchQuery } from "@/constant/interfaces";
import ChatBox from "./chatBox";

import { collapasMenu } from "@/lib/utils";

const SearchResult = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || process.env.ENDPOINT;
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const [searchQuery, setSearchQuery] = useState<ISearchQuery>({
    query: "",
    datasources: [],
  });
  const [hasLoadedInitialQuery, setHasLoadedInitialQuery] = useState(false); // Track if initial query has been loaded

  // Effect to set searchQuery based on URL params
  useEffect(() => {
    collapasMenu();
    const followUpSearch = document.getElementById("followup-search")
    followUpSearch?.classList.add("adjust-search")

    const qn = searchParams.get("question") || "";
    const ds = searchParams.get("datasources");
    const datasourcesArray = ds ? ds.split(",") : [];
    setSearchQuery({ query: qn, datasources: datasourcesArray });
  }, [searchParams]);

  // Effect to handle the initial API call on mount with valid parameters
  useEffect(() => {
    if (
      searchQuery.query &&
      searchQuery.datasources.length &&
      !hasLoadedInitialQuery
    ) {
      collapasMenu();
      handleSubmitQuery(searchQuery.query, searchQuery.datasources, false);
      setHasLoadedInitialQuery(true); // Prevent re-triggering from automatic state updates
    }
  }, [searchQuery, hasLoadedInitialQuery]);

  const handleSearchSubmit = async () => {
    const query = searchQuery.query;
    const datasources = searchQuery.datasources;

    if (query && datasources.length) {
      const queryString = createQueryString("question", query);
      const dataSourceString =
        datasources.length > 0
          ? createQueryString("datasources", datasources.join(","))
          : "";

      // Directly setting the URL to force a full page reload
      window.location.href = `/search?${queryString}&${dataSourceString}`;
    }
  };

  interface ChunkInfo {
    file_name: string;
    chunk_id: string;
    doc_id: string;
    chunk: string;
  }
  const [isResult, setIsResult] = useState(false);
  const [title, settitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<IChat[]>([]);
  const [sanitizedContent, setSanitizedContent] = useState<ChunkInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const isSelected = (docId: string) => selectedDocs.includes(docId);
  const [context, setContext] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelection = (chunkId: string) => {
    setSelectedDocs((prevDocs) => {
      if (prevDocs.includes(chunkId)) {
        return prevDocs.filter((id) => id !== chunkId);
      } else {
        return [...prevDocs, chunkId];
      }
    });
  };

  const handleSubmitQuery = async (
    query: string,
    datasources: string[],
    continuation: boolean
  ) => {
    collapasMenu();
    const urlParams = { query: query };
    const queryParamsString = new URLSearchParams(urlParams).toString();
    const fullUrl = `${endpoint}query?${queryParamsString}`;
    console.log("query", query, "datasources", datasources);

    const payload = {
      datasources,
      most_similar_section: true,
      filters: selectedDocs.length ? { doc_ids: selectedDocs } : {},
    };

    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      mode: "no-cors",
    };

    try {
      setLoading(true);
      setIsResult(true);

      // Clearing chat only if it's not a continuation
      if (!continuation) {
        setChat([]);
        setContext([]);
      }

      // Append user query to chat if not already last in chat
      setChat((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage?.content !== query || lastMessage?.sender !== "user") {
          return [...prevMessages, { sender: "user", content: query }];
        }
        return prevMessages;
      });

      // API call setup
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = "";
        let tempAnswer = "";
        let isDataReceived = false;
        setLoading(false);
        if (searchQuery.query) settitle(searchQuery.query);

        const processStream = ({ done, value }: any) => {
          if (done) {
            console.log("Stream complete");
            setChat((prevMessages) => [
              ...prevMessages,
              { sender: "bot", content: tempAnswer },
            ]);
            console.log("temp", tempAnswer);

            setAnswer("");
            return;
          }

          result += decoder.decode(value, { stream: true });

          if (!isDataReceived) {
            setSearchQuery({ ...searchQuery, query: "" });
            setAnswer("");
            isDataReceived = true;
          }

          let lines = result.split("\n");
          let lastLine = lines.pop();
          result = lastLine !== undefined ? lastLine : "";

          lines.forEach((line) => {
            if (line) {
              try {
                const data = JSON.parse(line);
                if (data.context && !continuation) {
                  setContext((prevContext: any) => [
                    ...prevContext,
                    data.context,
                  ]);
                }
                if (data.answer) {
                  setAnswer((prevAnswer) => prevAnswer + data.answer);
                  tempAnswer += data.answer;
                }
              } catch (error) {
                console.error("Error parsing JSON line", error);
              }
            }
          });

          reader
            .read()
            .then(processStream)
            .catch((err) => console.error("Failed to read", err));
        };

        reader
          .read()
          .then(processStream)
          .catch((err) => console.error("Failed to read", err));
      } else {
        setLoading(false);
        console.error("Failed to fetch the stream");
      }
    } catch (error) {
      setLoading(false);
      console.error("Failed to search query", error);
    }
  };

  useEffect(() => {
    const sanitizeMarkdown = async (markdownText: string) => {
      try {
        const markedText = await marked(markdownText.replace(/\n/g, " "));
        return DOMPurify.sanitize(markedText);
      } catch (error) {
        console.error(
          "Error during markdown sanitization:",
          markdownText,
          error
        );
        throw error; // Propagate the error to be handled in the calling function
      }
    };

    const processContext = async () => {
      try {
        const processedContent = await Promise.all(
          context.map(async (item: any, index: number) => {
            try {
              console.log(`Processing item ${index}:`, item); // Log the item being processed
              const item_json = JSON.parse(item.trim()); // Trim to avoid any unwanted whitespace issues
              const sanitizedHtml = await sanitizeMarkdown(item_json.chunk);
              return {
                file_name: item_json.metadata.file_name,
                doc_id: item_json.metadata.doc_id,
                chunk_id: item_json.metadata.chunk_id,
                chunk: sanitizedHtml,
              };
            } catch (error) {
              console.error(`Error processing item ${index}:`, item, error);
              return null; // Return null or a default object to avoid breaking the Promise.all
            }
          })
        );

        // Filter out any null entries from the results if errors occurred
        const validContent = processedContent.filter((item) => item !== null);
        setSanitizedContent(validContent);
      } catch (error) {
        console.error("Unexpected error in processContext:", error);
      }
    };

    processContext();
  }, [context]);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollTop = cardRef.current.scrollHeight;
    }
  }, [question, sanitizedContent]);

  return (
    <div className="relative flex flex-col">
      <div className="px-5">
        <h3>{title}</h3>
        <p className="text-gray-500">Relevant Results ({context.length})</p>
      </div>
      <div className="flex justify-between items-start gap-3 mb-14">
        <div
          className="relative w-1/2 min-w-96 max-h-[calc(100vh-240px)] overflow-auto"
          ref={cardRef}
        >
          {sanitizedContent.map((item, i) => (
            <div
              key={i}
              className="card cursor-pointer"
              onClick={() => toggleSelection(item.doc_id)}
              style={{
                borderColor: isSelected(item.doc_id) ? "green" : "initial",
                borderWidth: isSelected(item.doc_id) ? "3px" : "1px",
                borderStyle: "solid",
              }}
            >
              <p style={{ color: "purple" }}>File Name:</p>
              <p>{item.file_name}</p>
              <p style={{ color: "purple" }}>Chunk:</p>
              <p
                className="ellipsis"
                dangerouslySetInnerHTML={{ __html: item.chunk }}
              ></p>
            </div>
          ))}
          {loading && (
            <>
              <div className="card">
                <div role="status" className="w-full animate-pulse">
                  <div className="h-3 max-w-[150px] bg-gray-200 rounded-[6px] dark:bg-[--primary] dark:opacity-40 mb-3.5"></div>
                  <div className="h-3 max-w-[200px] bg-slate-400 rounded-[8px] dark:opacity-50 mb-3.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>{" "}
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                </div>
              </div>
              <div className="card">
                <div role="status" className="w-full animate-pulse">
                  <div className="h-3 max-w-[150px] bg-gray-200 rounded-[6px] dark:bg-[--primary] dark:opacity-40 mb-3.5"></div>
                  <div className="h-3 max-w-[200px] bg-slate-400 rounded-[8px] dark:opacity-50 mb-3.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>{" "}
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                </div>
              </div>
              <div className="card">
                <div role="status" className="w-full animate-pulse">
                  <div className="h-3 max-w-[150px] bg-gray-200 rounded-[6px] dark:bg-[--primary] dark:opacity-40 mb-3.5"></div>
                  <div className="h-3 max-w-[200px] bg-slate-400 rounded-[8px] dark:opacity-50 mb-3.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                </div>
              </div>
              <div className="card">
                <div role="status" className="w-full animate-pulse">
                  <div className="h-3 max-w-[150px] bg-gray-200 rounded-[6px] dark:bg-[--primary] dark:opacity-40 mb-3.5"></div>
                  <div className="h-3 max-w-[200px] bg-slate-400 rounded-[8px] dark:opacity-50 mb-3.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded-[8px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                </div>
              </div>
            </>
          )}
        </div>
        <ChatBox
          chat={chat}
          answer={answer}
          question={question}
          setQuestion={setQuestion}
          handleSubmitQuery={(query: string, continuation: boolean) =>
            handleSubmitQuery(query, searchQuery.datasources, continuation)
          }
          loading={loading}
        />
      </div>
      <form
        id="followup-search"
        className="search search-2 px-5 flex justify-center followup-search"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
      >
        <FollowUpSearch
          showType={true}
          value={searchQuery}
          setValue={setSearchQuery}
          loading={loading}
        />
      </form>
    </div>
  );
};

export default SearchResult;