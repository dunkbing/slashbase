package pgqueryengine

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/slashbaseide/slashbase/pkg/queryengines/utils"
)

type pgxConnPoolInstance struct {
	pgxConnPoolInstance *pgxpool.Pool
	LastUsed            time.Time
}

// getConnection establishes a PostgreSQL connection with SSL configuration.
// If useSSL is true, it uses sslmode=require for mandatory SSL.
// If useSSL is false, it uses sslmode=prefer for opportunistic SSL.
func (pxEngine *PostgresQueryEngine) getConnection(dbConnectionId, host string, port uint16, database, user, password string, useSSL bool) (c *pgxpool.Pool, err error) {
	if conn, exists := pxEngine.openConnections[dbConnectionId]; exists {
		pxEngine.mutex.Lock()
		pxEngine.openConnections[dbConnectionId] = pgxConnPoolInstance{
			pgxConnPoolInstance: conn.pgxConnPoolInstance,
			LastUsed:            time.Now(),
		}
		pxEngine.mutex.Unlock()
		return conn.pgxConnPoolInstance, nil
	}
	err = utils.CheckTcpConnection(host, strconv.Itoa(int(port)))
	if err != nil {
		return
	}

	// Build connection string with SSL support
	connString := fmt.Sprintf("host=%s port=%s dbname=%s user=%s password=%s", host, strconv.Itoa(int(port)), database, user, password)

	// Add SSL configuration
	if useSSL {
		connString += " sslmode=require"
	} else {
		connString += " sslmode=prefer"
	}

	pool, err := pgxpool.New(context.Background(), connString)
	if err != nil {
		return
	}
	if dbConnectionId != "" {
		pxEngine.mutex.Lock()
		pxEngine.openConnections[dbConnectionId] = pgxConnPoolInstance{
			pgxConnPoolInstance: pool,
			LastUsed:            time.Now(),
		}
		pxEngine.mutex.Unlock()
	}
	return pool, nil
}

func (pxEngine *PostgresQueryEngine) RemoveUnusedConnections() {
	for dbConnID, instance := range pxEngine.openConnections {
		now := time.Now()
		diff := now.Sub(instance.LastUsed)
		if diff.Minutes() > 20 {
			pxEngine.mutex.Lock()
			delete(pxEngine.openConnections, dbConnID)
			pxEngine.mutex.Unlock()
			go instance.pgxConnPoolInstance.Close()
		}
	}
}
