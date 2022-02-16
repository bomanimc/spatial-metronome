/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

 import * as React from "react";
 import PropTypes from "prop-types";
 import { useStaticQuery, graphql } from "gatsby";
 import { createGlobalStyle } from 'styled-components';
 import styled from "styled-components";
 
 const GlobalStyle = createGlobalStyle`
   html, body, div, span, applet, object, iframe,
   h1, h2, h3, h4, h5, h6, p, blockquote, pre,
   a, abbr, acronym, address, big, cite, code,
   del, dfn, em, img, ins, kbd, q, s, samp,
   small, strike, strong, sub, sup, tt, var,
   b, u, i, center,
   dl, dt, dd, ol, ul, li,
   fieldset, form, label, legend,
   table, caption, tbody, tfoot, thead, tr, th, td,
   article, aside, canvas, details, embed, 
   figure, figcaption, footer, header, hgroup, 
   menu, nav, output, ruby, section, summary,
   time, mark, audio, video {
     margin: 0;
     padding: 0;
     border: 0;
     font-size: 100%;
     font-family: "Brewery";
     font: inherit;
     vertical-align: baseline;
   }
   article, aside, details, figcaption, figure, 
   footer, header, hgroup, menu, nav, section {
     display: block;
   }
   body {
     line-height: 1;
   }
   ol, ul {
     list-style: none;
   }
   blockquote, q {
     quotes: none;
   }
   blockquote:before, blockquote:after,
   q:before, q:after {
     content: '';
     content: none;
   }
   table {
     border-collapse: collapse;
     border-spacing: 0;
   }
   
   html, body, #___gatsby, #gatsby-focus-wrapper {
     padding: 0;
     margin: 0;
     height: 100%;
     background: #000;
     color: #fff;
   }
 `;
 
 const Layout = ({ children }) => {
   const data = useStaticQuery(graphql`
     query SiteTitleQuery {
       site {
         siteMetadata {
           title
         }
       }
     }
   `)
 
   return (
     <>
       <GlobalStyle />
       <Layout.Main>{children}</Layout.Main>
     </>
   )
 };
 
 Layout.propTypes = {
   children: PropTypes.node.isRequired,
 };
 
 Layout.Main = styled.main`
   display: flex;
   flex: 1;
   height: 100vh;
 `;
 
 export default Layout
 