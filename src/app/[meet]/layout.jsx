"use server"
import React from "react";

import MeetPanel from "./MeetPanel";

export async function generateMetadata({ params }) {
  let res = await fetch(`${process.env.API_PATH}/${params.meet}`);
  if (res.ok) {
    res = await res.json();
    return { title: `${res.title} | Wang2Meet` };
  } else {
    return {};
  }
}

export default async function Meet({ params, children }) {
  return (
    <MeetPanel params={params}>
      {children}
    </MeetPanel>
  );
}

