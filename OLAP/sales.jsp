<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
  <%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

      <jp:mondrianQuery id="query01" jdbcDriver="com.mysql.jdbc.Driver"
        jdbcUrl="jdbc:mysql://localhost/dwh_adventureworks?user=root&password="
        catalogUri="/WEB-INF/queries/adventureworks.xml">

        SELECT {[Measures].[Amount], [Measures].[Tax Amount]} ON COLUMNS,
        {([Customer], [Product], [Territory].[All Territories], [Currency], [Tax])} ON ROWS
        FROM [Sales]

      </jp:mondrianQuery>

      <c:set var="title01" scope="session">
        Sales Cube (fact_sales)
      </c:set>