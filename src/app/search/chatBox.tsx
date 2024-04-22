import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import DOMPurify from "dompurify";

import { IChat } from "@/constant/interfaces";

interface IProps {
  chat: IChat[];
  answer: string;
  question: string;
  setQuestion: Dispatch<SetStateAction<string>>;
  handleSubmitQuery: (query: string, continuation: boolean) => Promise<void>;
  loading: boolean;
}

const ChatBox: React.FC<IProps> = ({
  chat,
  answer,
  question,
  setQuestion,
  handleSubmitQuery,
  loading,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [chat, answer]);

  return (
    <div className="relative flex flex-col justify-end w-1/2 min-w-96 border-primary rounded-xl mt-5 h-[calc(100vh-240px)]">
      <div>
        <div
          ref={divRef}
          className="p-4 max-h-[calc(100vh-380px)] overflow-auto"
        >
          {chat.map((item, i) => (
            <div
              className={`flex flex-row gap-5 items-start ${
                i === 0 ? "mt-0" : "mt-6"
              }`}
            >
              <div className="mt-1">
                {item.sender == "bot" ? (
                  <svg
                    width="18"
                    height="13"
                    viewBox="0 0 18 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.08247 5.28857L1 9.08239L9.08247 12.5463L17 9.08239L9.08247 5.28857Z"
                      stroke="black"
                      stroke-width="0.773109"
                    />
                    <path
                      d="M9.08247 1L1 4.79381L9.08247 8.25773L17 4.79381L9.08247 1Z"
                      fill="#D8B3E2"
                      stroke="black"
                      stroke-width="0.773109"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0C9.06087 0 10.0783 0.421427 10.8284 1.17157C11.5786 1.92172 12 2.93913 12 4C12 5.06087 11.5786 6.07828 10.8284 6.82843C10.0783 7.57857 9.06087 8 8 8C6.93913 8 5.92172 7.57857 5.17157 6.82843C4.42143 6.07828 4 5.06087 4 4C4 2.93913 4.42143 1.92172 5.17157 1.17157C5.92172 0.421427 6.93913 0 8 0ZM8 10C12.42 10 16 11.79 16 14V16H0V14C0 11.79 3.58 10 8 10Z"
                      fill="#3A189B"
                    />
                  </svg>
                )}
              </div>
              <div className="text-justify">
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.content),
                  }}
                />
              </div>
            </div>
          ))}
          {answer.length > 0 && (
            <div className="flex flex-row gap-5 mt-8 items-start">
              <div className="mt-1">
                <svg
                  width="18"
                  height="13"
                  viewBox="0 0 18 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.08247 5.28857L1 9.08239L9.08247 12.5463L17 9.08239L9.08247 5.28857Z"
                    stroke="black"
                    stroke-width="0.773109"
                  />
                  <path
                    d="M9.08247 1L1 4.79381L9.08247 8.25773L17 4.79381L9.08247 1Z"
                    fill="#D8B3E2"
                    stroke="black"
                    stroke-width="0.773109"
                  />
                </svg>
              </div>
              <div>
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(answer),
                  }}
                />
              </div>
            </div>
          )}
          {loading && (
            <div className="flex flex-row gap-5 mt-8 items-start">
              <div className="mt-1">
                <svg
                  width="18"
                  height="13"
                  viewBox="0 0 18 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.08247 5.28857L1 9.08239L9.08247 12.5463L17 9.08239L9.08247 5.28857Z"
                    stroke="black"
                    stroke-width="0.773109"
                  />
                  <path
                    d="M9.08247 1L1 4.79381L9.08247 8.25773L17 4.79381L9.08247 1Z"
                    fill="#D8B3E2"
                    stroke="black"
                    stroke-width="0.773109"
                  />
                </svg>
              </div>
              <div role="status" className="w-full animate-pulse">
                <div className="h-2 bg-gray-200 rounded-[1px] dark:bg-[--primary] dark:opacity-40 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-[1px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-[1px] dark:bg-[--primary] dark:opacity-50 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-[1px] dark:bg-[--primary] dark:opacity-50 max-w-[250px] mb-2.5"></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-row items-center align-end gap-2 border-primary m-4 mt-2 p-3 rounded-xl">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M15 15L10.3333 10.3333M1 6.44444C1 7.15942 1.14082 7.86739 1.41443 8.52794C1.68804 9.18849 2.08908 9.78868 2.59464 10.2942C3.1002 10.7998 3.7004 11.2008 4.36095 11.4745C5.0215 11.7481 5.72947 11.8889 6.44444 11.8889C7.15942 11.8889 7.86739 11.7481 8.52794 11.4745C9.18849 11.2008 9.78868 10.7998 10.2942 10.2942C10.7998 9.78868 11.2008 9.18849 11.4745 8.52794C11.7481 7.86739 11.8889 7.15942 11.8889 6.44444C11.8889 5.72947 11.7481 5.0215 11.4745 4.36095C11.2008 3.7004 10.7998 3.1002 10.2942 2.59464C9.78868 2.08908 9.18849 1.68804 8.52794 1.41443C7.86739 1.14082 7.15942 1 6.44444 1C5.72947 1 5.0215 1.14082 4.36095 1.41443C3.7004 1.68804 3.1002 2.08908 2.59464 2.59464C2.08908 3.1002 1.68804 3.7004 1.41443 4.36095C1.14082 5.0215 1 5.72947 1 6.44444Z"
              stroke="black"
              strokeOpacity="0.3"
              strokeWidth="1.55556"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <textarea
            placeholder="Refine your search..."
            value={question}
            className="w-full text-wrap resize-none bg-transparent"
            wrap="soft"
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitQuery(question, true);
              }
            }}
          />
          <button onClick={() => handleSubmitQuery(question, true)}>
            <svg width="28" height="25" viewBox="0 0 28 25" fill="none">
              <g filter="url(#filter0_d_119_442)">
                <path
                  d="M3.39941 20.0001V13.2501L12.4942 11.0001L3.39941 8.75005V2L24.9996 11.0001L3.39941 20.0001Z"
                  fill="#6B4AC7"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_119_442"
                  x="0.459391"
                  y="0.259987"
                  width="27.4806"
                  height="23.88"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="1.20001" />
                  <feGaussianBlur stdDeviation="1.47001" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_119_442"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_119_442"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;