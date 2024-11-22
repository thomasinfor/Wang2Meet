import styled from "@emotion/styled";

export const Tables = styled.div`
  display: flex;
  justify-content: center;
  width: 100vw;
  // gap: 20px;
  flex-wrap: wrap;
  overflow: auto;
  padding: 0 10px;
  box-sizing: border-box;
`;
const Container = styled.div`
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  border: 1px dashed black;
  border-radius: 5px;
`;
export const SplitViewContainer = styled(Container)`
  width: 48%;
  &:not(.hidden):last-of-type {
    margin-left: 20px;
  }
  @media (max-width: 700px) {
    width: 100%;
    margin-left: 0!important;
  }
  &.no-border {
    border: none;
  }
  &.hidden {
    width: 0;
    border-left: none;
    border-right: none;
    visibility: hidden;
  }
`;
export const TableWrapper = styled.div`
  max-width: 100%;
  max-height: 95vh;
`;