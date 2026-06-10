"use client";
import React, { Suspense } from "react";
import Hero from "./Hero";
import { ClipLoader } from "react-spinners";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <ClipLoader color="#896cef" size={50} />
    </div>}>
      <Hero />
    </Suspense>
  );
}
