import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useGetOrden } from '../../shared/hooks/useGetOrden';
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import { useOrdenById } from '../../shared/hooks/useordenDetalleById';
import {Grid} from "@mui/joy";

const getColumnsByRole = (role) => {
    const commonColumns = [
        { id: 'id', label: 'ID de Orden' },
        { id: 'direccion', label: 'Dirección' },
        { id: 'telefono', label: 'Teléfono' },
        { id: 'fechaEntrega', label: 'Fecha de Entrega' },
        { id: 'total', label: 'Total de la Orden', align: 'right', format: (value) => value.toFixed(2) },
    ];

    if (role === 'Admin') {
        return [
            { id: 'id', label: 'ID de Orden' },
            { id: 'nombre', label: 'Nombre Completo' },
            { id: 'email', label: 'Correo Electrónico' },
            ...commonColumns.slice(1),
            { id: 'negar', label: 'Botón' }
        ];
    }

    return commonColumns;
};

const decodeJWT = (token) => {
    if (!token) {
        return null;
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

const decodedToken = decodeJWT(localStorage.getItem('token'));
const columns = getColumnsByRole(decodedToken.userRol);

export default function OrdenList() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(105);
    const [ordenes, loading, error] = useGetOrden(page, rowsPerPage);
    const [selectedOrderId, setSelectedOrderId] = React.useState(null);
    const { orderDetail, isLoading: detailLoading, error: detailError } = useOrdenById(selectedOrderId);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleButtonClick = (id) => {
        setSelectedOrderId(id);
    };


    if (loading || detailLoading) {
        return <div>Loading...</div>;
    }

    if (error || detailError) {
        return <div>Error: {error ? error.message : detailError.message}</div>;
    }

    return (
        <Grid container spacing={2} className='row'
              justifyContent="center" // Centrar horizontalmente
              alignItems="flex-start" // Alineación vertical al inicio
              sx={{ minHeight: '100vh', padding: 2 }} // Altura mínima y relleno
        >
            <Grid xs={12} sm={12} md={12} lg={12}>
                <Paper sx={{width: '100%', overflow: 'hidden',
                    padding: { xs: 2, sm: 3, md: 4 },
                    margin: { xs: 1, sm: 2 },}}>
                    <Typography
                        sx={{flex: '1 1 100%'}}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        <h3 style={{fontWeight: 'bold'}}>Listado de ordenes</h3>
                    </Typography>
                    <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{minWidth: column.minWidth}}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(ordenes) && ordenes
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {column.id === 'negar' ? (
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={() => handleButtonClick(row.id)}
                                                                >
                                                                    Buscar Detalle
                                                                </Button>
                                                            ) : (
                                                                column.format && typeof value === 'number'
                                                                    ? column.format(value)
                                                                    : value
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        labelRowsPerPage='Items por página'
                        showFirstButton={true}
                        showLastButton={true}
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={Array.isArray(ordenes) ? ordenes.length : 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Grid>

        </Grid>
    );
}