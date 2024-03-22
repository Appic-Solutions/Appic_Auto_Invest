"use client"

import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import { useState, useEffect } from "react"
const itemsPerPage = 5; // Number of items to display per page
const maxPageNumbers = 3; // Maximum number of page numbers to show


function Pagination({ data, setDataToBeShown, setCoinsPageNumber, coinsPageNumber }) {

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);


  useEffect(() => {
    setDataToBeShown(
      data
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
  }, [currentPage])
  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= maxPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfMax = Math.floor(maxPageNumbers / 2);
      const start = Math.max(1, currentPage - halfMax);
      const end = Math.min(totalPages, start + maxPageNumbers - 1);

      if (start > 1) {
        pageNumbers.push(1);
        if (start > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };


  const handlePageChange = (newPage) => {
    setCoinsPageNumber(newPage)
    setCurrentPage(newPage);
  };



  return (





    <div className={darkModeClassnamegenerator("pagination")}>


      {getPageNumbers().map((pageNumber, index) => (
        <button
          key={index}
          onClick={() =>
            typeof pageNumber === 'number' && handlePageChange(pageNumber)
          }
          className={currentPage === pageNumber ? 'active' : ''}
        >
          {pageNumber}
        </button>
      ))}


    </div>

  );
}

export default Pagination;