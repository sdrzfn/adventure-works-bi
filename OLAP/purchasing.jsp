<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
  <%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

      <jp:mondrianQuery id="query01" jdbcDriver="com.mysql.jdbc.Driver"
        jdbcUrl="jdbc:mysql://localhost/dwh_adventureworks?user=root&password="
        catalogUri="/WEB-INF/queries/adventureworks.xml">

        SELECT
        { [Measures].[Total Purchase Amount], [Measures].[Purchase Tax Amount] } ON COLUMNS,
        { ( [Vendor], [Product], [Territory].[All Territories], [Currency], [Tax] ) } ON ROWS
        FROM [Purchasing]

      </jp:mondrianQuery>

      <c:set var="title01" scope="session">
        Purchasing Cube (fact_purchasing)
      </c:set>